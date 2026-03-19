#!/usr/bin/env python3
"""
Simple GA4 query CLI using Google Analytics Data API.

Usage:
  python3 scripts/ga4_query.py --property-id 123456789 --preset overview --start-date 7daysAgo --end-date yesterday
  python3 scripts/ga4_query.py --property-id 123456789 --metrics activeUsers,sessions --dimensions date
"""

import argparse
import json
import sys

try:
    from google.analytics.data_v1beta import BetaAnalyticsDataClient
    from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest
except ImportError:
    print("Missing dependency: google-analytics-data")
    print("Install with: pip install google-analytics-data")
    sys.exit(1)

PRESETS = {
    "overview": {
        "metrics": ["activeUsers", "sessions", "screenPageViews", "eventCount", "totalRevenue"],
        "dimensions": ["date"],
    },
    "traffic": {
        "metrics": ["sessions", "activeUsers", "conversions"],
        "dimensions": ["sessionDefaultChannelGroup"],
    },
    "landing": {
        "metrics": ["sessions", "engagedSessions", "conversions"],
        "dimensions": ["landingPagePlusQueryString"],
    },
}


def parse_csv(value: str):
    return [v.strip() for v in value.split(",") if v.strip()]


def main():
    parser = argparse.ArgumentParser(description="Query GA4 reports")
    parser.add_argument("--property-id", required=True, help="GA4 property ID, e.g. 123456789")
    parser.add_argument("--start-date", default="7daysAgo", help="e.g. 7daysAgo, 2026-02-01")
    parser.add_argument("--end-date", default="yesterday", help="e.g. yesterday, 2026-02-29")
    parser.add_argument("--preset", choices=PRESETS.keys(), help="Use predefined metrics/dimensions")
    parser.add_argument("--metrics", help="Comma-separated metric names")
    parser.add_argument("--dimensions", help="Comma-separated dimension names")
    parser.add_argument("--limit", type=int, default=100)

    args = parser.parse_args()

    if args.preset:
        preset = PRESETS[args.preset]
        metrics = preset["metrics"]
        dimensions = preset["dimensions"]
    else:
        if not args.metrics:
            print("--metrics is required when --preset is not provided")
            sys.exit(2)
        metrics = parse_csv(args.metrics)
        dimensions = parse_csv(args.dimensions or "")

    client = BetaAnalyticsDataClient()

    request = RunReportRequest(
        property=f"properties/{args.property_id}",
        dimensions=[Dimension(name=d) for d in dimensions],
        metrics=[Metric(name=m) for m in metrics],
        date_ranges=[DateRange(start_date=args.start_date, end_date=args.end_date)],
        limit=args.limit,
    )

    response = client.run_report(request)

    rows = []
    for row in response.rows:
        item = {}
        for i, d in enumerate(dimensions):
            item[d] = row.dimension_values[i].value
        for i, m in enumerate(metrics):
            item[m] = row.metric_values[i].value
        rows.append(item)

    print(json.dumps({
        "property_id": args.property_id,
        "start_date": args.start_date,
        "end_date": args.end_date,
        "dimensions": dimensions,
        "metrics": metrics,
        "row_count": len(rows),
        "rows": rows,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
