---
name: design-ui-legacy-premium-polish
description: Legacy compatibility entry for soft-skill. Redirects premium UI refinement requests to design-ui premium polish mode.
---

# Legacy compatibility: soft-skill

## Status
Treat this as a compatibility wrapper for older `soft-skill` usage. For new usage, prefer `design-ui` and specify `premium polish` mode.

## Routing
When this skill is triggered:
1. Interpret the request as `design-ui` with `premium polish` mode.
2. Keep the old intent intact: make interfaces feel more expensive, more composed, and more finely animated.
3. Do not present this as a separate top-level design choice for new users.

## Premium polish preset
- Increase surface hierarchy using nested containers, hairlines, subtle inner highlights, and cleaner material contrast.
- Use richer spacing rhythm, better CTA composition, and more deliberate visual pacing.
- Add refined motion choreography: staggered reveal, smoother easing, tactile active states, and stronger hover feedback.
- Allow subtle glass/refraction only where performance-safe and structurally justified.

## Avoid
- Harsh generic shadows, blunt gray borders, abrupt transitions, and repetitive template layouts.
- Over-designed effects that overpower readability or product trust.
- Performance-heavy blur and animation patterns on scrolling content.

## Positioning
- Use `design-ui` for new work.
- Use `redesign-skill` when the request is to audit and upgrade an existing product incrementally without rewriting it.
