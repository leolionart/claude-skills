---
name: design-ui
description: Canonical frontend design skill for creating, reviewing, or restyling UI across 6 design families and 20 exemplars, from editorial and SaaS clarity to premium, tactile, and experimental directions.
version: 1.1.0
---

# Design UI

## Purpose
Use this as the canonical design brain for most frontend/UI requests. Handle new UI work, polish passes, style selection, review, and style conversion through one family-and-exemplar system instead of scattered top-level modes.

## Use this skill when
- create a new UI, page, component, landing page, or dashboard
- steer a brief toward a clear visual family or exemplar
- review an existing screen for style fidelity
- convert one visual direction into another without changing product goals

## Do not use this skill when
- need an audit-first, low-risk redesign of an existing shipped product without changing its structure. Use `redesign-skill`.
- need brand strategy, design system governance, or product requirements outside frontend UI execution

## Route first
1. Determine intent: choose, build, review, or convert.
2. Classify the brief with `references/router.md`.
3. Load `references/design-taxonomy.md` when the user speaks in mood words, visual keywords, or art-direction language.
4. Translate the chosen direction with `references/coding-axes.md`.
5. For review or conversion tasks, follow `references/review-conversion.md`.
6. Load the matching family pack under `references/families/<family>/`.
7. Open one exemplar pack only after the family is clear.

## Family system
- `high-agency` -> flagship launches, asymmetry, strong hierarchy, anti-generic marketing
- `editorial-typography` -> refined, reading-first, manifesto, luxury, typography-led work
- `grid-product` -> SaaS, AI, dashboards, modular explainers, scan-friendly product marketing
- `immersive-premium` -> glass, glow, 3D, atmosphere, cinematic premium tech
- `tactile-organic` -> soft, rounded, ambient, approachable, friendly product directions
- `experimental-loud` -> neo-brutalism, Y2K, anti-design, culture-led disruption

## Shared execution rules
1. Match the existing stack; do not migrate frameworks or styling systems just to improve design.
2. Use one primary family and at most one secondary influence.
3. Translate style into hierarchy, layout, typography, density, surfaces, motion, and component treatment.
4. Name what to remove, not only what to add.
5. Keep mobile collapse explicit; bold desktop compositions must still reduce cleanly on smaller screens.
6. Add complete states when writing UI: loading, empty, error, hover, active, focus.
7. Keep animation GPU-safe: prefer `transform` and `opacity`; avoid effect-heavy motion with no hierarchy role.
8. Avoid AI defaults: `Inter`, purple/blue AI gradients, generic 3-column feature rows, card spam, and dead-flat motion.

## Output contract
Return these blocks in order:
1. Recommended family
2. Best-matching exemplar styles
3. Why this fit works
4. Coding directives
5. Avoid list
6. Next action

## Resources
- `references/router.md` for family and exemplar classification
- `references/design-taxonomy.md` for broader style language
- `references/coding-axes.md` for build translation
- `references/review-conversion.md` for critique and restyling
- `references/families/*/doctrine.md` for family grammar
- `references/families/*/recipes.md` for chooser logic
- `references/families/*/exemplars/*.md` for precision packs

## Relationship to redesign-skill
- `design-ui` = canonical skill for new UI work, style direction, style review, and restyling across many aesthetic families
- `redesign-skill` = audit-first workflow for improving existing shipped interfaces with minimal disruption
