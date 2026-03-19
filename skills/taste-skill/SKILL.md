---
name: design-ui-legacy-default
description: Legacy compatibility entry for the old taste-skill trigger. Redirects general frontend design requests to design-ui default high-agency mode.
---

# Legacy compatibility: taste-skill

## Status
Treat this as a compatibility wrapper for older prompts and marketplace installs. For new usage, prefer `design-ui`.

## Routing
When this skill is triggered:
1. Interpret the request as `design-ui` with `default high-agency` mode.
2. Keep the same intent coverage that `taste-skill` historically owned: premium-looking UI, layout direction, spacing, motion, and anti-generic frontend decisions.
3. Do not present this as a separate top-level choice unless the user explicitly asked for `taste-skill`.

## Core behavior to preserve
- Check dependencies before importing libraries.
- Match the existing framework and styling system.
- Prefer one primary design language with 1-2 supporting treatments.
- Avoid common AI defaults: `Inter`, purple/blue AI gradients, generic 3-column feature rows, card spam, dead-flat motion.
- Keep mobile fallbacks explicit for asymmetric desktop layouts.
- Add full interaction states: loading, empty, error, hover, active, focus.
- Keep animation GPU-safe via `transform` and `opacity`.

## Default mode mapping
Map directly to `design-ui` defaults:
- Mode: `default high-agency`
- Variance: high but still product-aware
- Motion: moderate unless user asks for calmer or more cinematic behavior
- Density: low to medium unless the UI is clearly data-heavy

## Positioning
- Use `design-ui` for new work.
- Use `redesign-skill` instead when the task is an audit-first redesign of an existing product with low-risk iterative fixes.
