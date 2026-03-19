---
name: design-ui-legacy-minimalist
description: Legacy compatibility entry for minimalist-skill. Redirects editorial and monochrome frontend requests to design-ui minimalist editorial mode.
---

# Legacy compatibility: minimalist-skill

## Status
Treat this as a compatibility wrapper for users who still call `minimalist-skill`. For new usage, prefer `design-ui` and specify `minimalist editorial` mode.

## Routing
When this skill is triggered:
1. Interpret the request as `design-ui` with `minimalist editorial` mode.
2. Keep the old intent intact: calm, document-like, workspace, monochrome, typographically-led interfaces.
3. Do not frame this as a separate top-level skill family for new users.

## Minimalist editorial preset
- Use warm white or off-white canvases and off-black body text.
- Favor crisp borders, restrained radii, flat or near-flat surfaces, and sparse accent color.
- Use strong typographic hierarchy; serif is allowed only when the product context supports editorial tone.
- Keep motion subtle, slow, and almost invisible.
- Prefer asymmetrical but disciplined grids over flashy hero compositions.

## Avoid
- Gradients, neon accents, and glass-heavy treatment.
- Thick icon sets, heavy drop shadows, and oversized pill patterns.
- Loud marketing clichés or decorative motion with no structural role.

## Positioning
- Use `design-ui` for new work.
- Use `redesign-skill` when improving an existing shipped interface through audit-first, low-risk changes.
