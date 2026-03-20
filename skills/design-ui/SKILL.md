---
name: design-ui
description: Canonical frontend design skill for new UI work, polish passes, style direction, minimalist/editorial modes, and premium refinement without splitting intent across multiple skills.
---

# Design UI

## Purpose
Provide the canonical design brain for most frontend/UI requests. Use it for new UI work, polish passes, style direction, and mode-based refinement without splitting intent across multiple top-level skills.

## Use this skill when
- Create a new UI, page, component, landing page, or dashboard.
- Polish an existing screen without needing a full audit workflow.
- Ask for stronger typography, spacing, layout direction, motion, or visual quality.
- Want a specific style mode such as `minimalist editorial`, `premium polish`, or `structured technical`.

## Do not use this skill when
- Need an audit-first, low-risk redesign of an existing product without rewriting its structure. Use `redesign-skill`.
- Need brand assets, design systems, or product requirements outside frontend UI execution.

## Mode selection
Pick one mode before writing code. If user does not specify, default to `default high-agency`.

| Mode | Use when | Core behavior |
| --- | --- | --- |
| `default high-agency` | General premium UI work | Favor anti-generic layout, strong typography, controlled motion, and broad design-taxonomy coverage |
| `minimalist editorial` | User wants calm, document-like, workspace, monochrome, editorial UI | Favor warm monochrome palettes, crisp borders, restrained motion, and typographic contrast |
| `premium polish` | User wants expensive, agency-like, cinematic refinement | Favor nested surfaces, richer motion choreography, premium depth, and stronger materiality |
| `structured technical` | Developer tools, docs, explainers, technical dashboards | Favor modular layouts, geometric clarity, lineart, material colors, and restrained ornament |

## Shared execution rules
1. Check project dependencies before importing any library.
2. Match the existing stack; do not migrate frameworks or styling systems just to improve design.
3. Use exactly one primary design language plus 1-2 supporting treatments.
4. Avoid AI defaults: `Inter`, purple/blue AI gradients, generic 3-column feature rows, default card spam, dead-flat motion.
5. Keep mobile collapse explicit: asymmetric desktop layouts must fall back to simple single-column mobile layouts.
6. Add complete interaction states when writing UI: loading, empty, error, hover, active, focus.
7. Keep animation GPU-safe: prefer `transform` and `opacity`; avoid scroll listeners when IntersectionObserver or motion primitives work.

## Direction system
Use this shared taxonomy when steering output:
- Primary language: `Swiss`, `modular layouts`, `asymmetry`, `floating`, `broken grid layouts`, `geometric`
- Supporting treatments: `muted colors`, `subtle colored shadows`, `semi-flat depth`, `dynamic gradients`, `duotone`
- Imagery modes: `lineart`, `isometric`, `abstract geometrical`, `tailored illustrations`, `authentic photography`, `hero image`
- Avoid list: name 2-4 things to avoid so the visual direction stays coherent
- Load `references/design-taxonomy.md` when the user speaks in style keywords, wants richer art-direction language, or needs product-context direction mapping

## Mode-specific overrides
### default high-agency
- Start with high variance, moderate motion, and low-to-medium density.
- Prefer premium sans pairings, asymmetry, strong hierarchy, and anti-generic interaction states.

### minimalist editorial
- Use warm whites, off-black text, ultra-light borders, low-shadow surfaces, editorial serif only when context supports it.
- Favor document rhythm, crisp radii, flat composition, sparse accent color, and quiet motion.
- Avoid gradients, neon, thick icon sets, heavy shadows, and oversized pill-heavy component styling.

### premium polish
- Use richer surface hierarchy, nested containers, hairlines, subtle glass/refraction only where performance-safe.
- Favor cinematic spatial rhythm, button micro-physics, staggered reveal, and stronger materiality.
- Avoid harsh default shadows, blunt borders, abrupt motion, and repetitive template-like layouts.

### structured technical
- Favor clean grids, modular composition, lineart, monospace support for numbers/code, and information clarity first.
- Avoid decorative art direction that harms scanability or trust.

## Output contract
When design direction matters, structure response like this:

```md
## Visual read
- Current style signals:
- What feels generic or mismatched:

## Recommended direction
- Selected mode:
- Primary design language:
- Supporting treatments:
- Imagery mode:
- Avoid list:

## Practical adjustments
- Layout:
- Typography:
- Color:
- Surfaces / depth:
- Motion / states:
```

## Quick visual overview
See `../../docs/` for the Jekyll-powered public showcase where `design-ui` is framed as one canonical skill with four art-directed mode microsites on the same pseudo-UI scenario, plus copy-ready prompt handoff for each mode.

## Relationship to redesign-skill
- `design-ui` is the canonical skill for new UI work, polish passes, and style-direction requests.
- `redesign-skill` remains separate because it is an audit-first workflow, not just a style preset.
