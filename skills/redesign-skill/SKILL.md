---
name: redesign-existing-projects
description: Audit-first frontend redesign skill for upgrading existing websites and apps with low-risk, stack-preserving improvements instead of rewrites.
---

# Redesign skill

## Purpose
Use this skill for existing products that already ship code and need better visual quality without a rewrite. Reuse the same design brain as `design-ui`, but operate in audit-first mode: scan, diagnose, then apply targeted fixes.

## Use this skill when
- Improve an existing site, app, dashboard, or marketing page already present in the repo.
- Keep the current framework, styling system, and feature set.
- Want reviewable, low-risk visual upgrades instead of creating a new design language from scratch.

## Do not use this skill when
- Building a new UI from scratch. Use `design-ui`.
- The request is mainly about picking a style preset like minimalist/editorial or premium polish for new work. Use `design-ui` modes.

## Workflow
1. **Scan** — Read the codebase. Identify framework, styling method, component patterns, and missing states.
2. **Diagnose** — Audit typography, color, surfaces, layout, interactivity, content realism, iconography, and code quality.
3. **Fix** — Apply the smallest set of changes that noticeably improves the design without breaking behavior.
4. **Verify** — Confirm the stack still fits, imports are real, and upgrades remain reviewable.

## Design lens
Borrow the same core standards as `design-ui`:
- Avoid generic AI defaults such as `Inter`, purple/blue AI gradients, repetitive 3-card rows, card spam, and dead-flat motion.
- Use one primary design language with limited supporting treatments.
- Prefer mobile-safe layouts, explicit states, and GPU-safe animation.

## Audit priorities
Fix in this order for best impact with low risk:
1. Font and hierarchy
2. Color palette cleanup
3. Hover, active, focus, loading, empty, and error states
4. Layout spacing, container width, and alignment rhythm
5. Replacement of cliché component patterns
6. Final surface and motion polish

## Low-risk redesign rules
- Work with the existing stack; do not migrate frameworks or styling systems.
- Keep changes focused and reviewable.
- Check dependencies before importing libraries.
- Prefer targeted improvements over sweeping rewrites.
- Preserve functionality and content structure unless the task explicitly allows deeper redesign.

## Quick visual overview
See `../../docs/` for the Jekyll-powered visual gallery that positions `redesign-skill` as a separate audit-first workflow next to the four `design-ui` modes.

## Relationship to design-ui
- `design-ui` = canonical skill for new UI work and style-direction requests.
- `redesign-skill` = audit-first workflow for improving existing shipped interfaces with minimal disruption.
