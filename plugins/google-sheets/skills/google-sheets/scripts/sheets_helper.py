#!/usr/bin/env python3
"""
Google Sheets Helper — wrapper around `gws` CLI for common Sheets operations.
Yêu cầu: gws CLI đã cài và đã xác thực (`gws auth login` hoặc service account)
"""

import argparse
import csv
import json
import subprocess
import sys
from pathlib import Path


def run_gws(args: list[str]) -> dict:
    """Chạy gws CLI và trả về JSON output."""
    result = subprocess.run(
        ["gws"] + args,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"Error (exit {result.returncode}): {result.stderr}", file=sys.stderr)
        sys.exit(result.returncode)
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return {"raw": result.stdout}


def read_sheet(sheet_id: str, range_: str) -> list[list]:
    """Đọc dữ liệu từ Sheets, trả về list of rows."""
    data = run_gws([
        "sheets", "spreadsheets", "values", "get",
        "--params", json.dumps({"spreadsheetId": sheet_id, "range": range_}),
    ])
    return data.get("values", [])


def print_table(rows: list[list], max_rows: int = 20) -> None:
    """In dữ liệu dạng markdown table."""
    if not rows:
        print("(no data)")
        return

    headers = rows[0] if rows else []
    data = rows[1:max_rows + 1] if len(rows) > 1 else []

    # Tính độ rộng cột
    col_widths = [len(str(h)) for h in headers]
    for row in data:
        for i, cell in enumerate(row):
            if i < len(col_widths):
                col_widths[i] = max(col_widths[i], len(str(cell)))
            else:
                col_widths.append(len(str(cell)))

    def format_row(cells):
        padded = [str(cells[i]).ljust(col_widths[i]) if i < len(cells) else " " * col_widths[i]
                  for i in range(len(col_widths))]
        return "| " + " | ".join(padded) + " |"

    print(format_row(headers))
    print("| " + " | ".join("-" * w for w in col_widths) + " |")
    for row in data:
        print(format_row(row))

    if len(rows) > max_rows + 1:
        print(f"\n... và {len(rows) - max_rows - 1} hàng nữa (tổng {len(rows) - 1} hàng)")


def append_rows(sheet_id: str, range_: str, rows: list[list]) -> None:
    """Append rows vào Sheets."""
    data = run_gws([
        "sheets", "spreadsheets", "values", "append",
        "--params", json.dumps({
            "spreadsheetId": sheet_id,
            "range": range_,
            "valueInputOption": "USER_ENTERED",
        }),
        "--json", json.dumps({"values": rows}),
    ])
    updates = data.get("updates", {})
    print(f"Appended {updates.get('updatedRows', '?')} rows to {updates.get('updatedRange', range_)}")


def import_csv(sheet_id: str, range_: str, csv_file: str) -> None:
    """Import CSV file vào Sheets."""
    path = Path(csv_file)
    if not path.exists():
        print(f"File not found: {csv_file}", file=sys.stderr)
        sys.exit(1)

    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)

    print(f"Importing {len(rows)} rows từ {csv_file}...")
    append_rows(sheet_id, range_, rows)


def export_csv(sheet_id: str, range_: str, output: str) -> None:
    """Export Sheets data ra CSV file."""
    rows = read_sheet(sheet_id, range_)
    path = Path(output)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    print(f"Exported {len(rows)} rows to {output}")


def main():
    parser = argparse.ArgumentParser(
        description="Google Sheets helper — wrapper cho gws CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ví dụ:
  # Đọc và hiển thị table
  python3 sheets_helper.py read --sheet-id 1abc... --range "Sheet1!A1:D20"

  # Import CSV
  python3 sheets_helper.py import-csv --sheet-id 1abc... --range "Sheet1!A1" --file data.csv

  # Export CSV
  python3 sheets_helper.py export-csv --sheet-id 1abc... --range "Sheet1" --output out.csv
        """,
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # read command
    read_parser = subparsers.add_parser("read", help="Đọc và hiển thị Sheets data")
    read_parser.add_argument("--sheet-id", required=True, help="Spreadsheet ID")
    read_parser.add_argument("--range", required=True, help="Range, vd: Sheet1!A1:D10")
    read_parser.add_argument("--max-rows", type=int, default=20, help="Số hàng hiển thị tối đa")

    # import-csv command
    import_parser = subparsers.add_parser("import-csv", help="Import CSV vào Sheets")
    import_parser.add_argument("--sheet-id", required=True, help="Spreadsheet ID")
    import_parser.add_argument("--range", required=True, help="Range bắt đầu, vd: Sheet1!A1")
    import_parser.add_argument("--file", required=True, help="Đường dẫn file CSV")

    # export-csv command
    export_parser = subparsers.add_parser("export-csv", help="Export Sheets ra CSV")
    export_parser.add_argument("--sheet-id", required=True, help="Spreadsheet ID")
    export_parser.add_argument("--range", required=True, help="Range cần export")
    export_parser.add_argument("--output", required=True, help="File CSV đầu ra")

    args = parser.parse_args()

    if args.command == "read":
        rows = read_sheet(args.sheet_id, args.range)
        print(f"\n📊 {args.sheet_id} — {args.range}\n")
        print_table(rows, max_rows=args.max_rows)

    elif args.command == "import-csv":
        import_csv(args.sheet_id, args.range, args.file)

    elif args.command == "export-csv":
        export_csv(args.sheet_id, args.range, args.output)


if __name__ == "__main__":
    main()
