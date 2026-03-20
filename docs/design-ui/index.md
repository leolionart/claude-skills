---
layout: default
title: design-ui gallery
description: Compare the four canonical design-ui modes on the same pseudo-UI scenario and jump into a dedicated page for each mode.
page_class: theme-gallery-high-agency
---

<section class="shell section hero hero-home">
  <div class="hero-copy stack-lg">
    <p class="section-kicker">Canonical frontend design skill</p>
    <h1><code>design-ui</code> has exactly four modes.</h1>
    <p class="lead">Use it for new UI work, polish requests, visual direction, and frontend refinement. If the user does not specify a mode, default to <code>default high-agency</code>.</p>
    <div class="hero-actions">
      <a class="button button-primary" href="{{ '/#gallery' | relative_url }}">Back to homepage gallery</a>
      <a class="button button-secondary" href="{{ '/redesign-skill/' | relative_url }}">Need audit-first redesign?</a>
    </div>
  </div>

  <div class="hero-panel surface-card stack-md">
    <p class="meta-label">Shared preview rule</p>
    <h2>{{ site.data.site.same_scenario.title }}</h2>
    <p><strong>{{ site.data.site.same_scenario.product_name }}</strong> is the shared pseudo-product: {{ site.data.site.same_scenario.product_summary }}</p>
    <p>That keeps comparisons honest: layout structure stays stable while typography, depth, palette, border treatment, and composition shift by mode.</p>
  </div>
</section>

<section class="shell section section-tight">
  <div class="section-heading stack-md">
    <p class="section-kicker">Mode compare</p>
    <h2>Browse the four canonical choices.</h2>
  </div>

  <div class="mode-grid gallery-grid">
    {% for mode in site.data.design_ui_modes %}
      {% include mode-card.html mode=mode %}
    {% endfor %}
  </div>
</section>

<section class="shell section section-tight">
  <div class="legacy-panel stack-md">
    <p class="section-kicker">Canonical framing</p>
    <p><code>redesign-skill</code> is intentionally not included as a fifth mode here. It remains a separate workflow for audit-first improvement of an existing shipped product.</p>
    <a class="text-link" href="{{ '/redesign-skill/' | relative_url }}">Open the redesign workflow page</a>
  </div>
</section>
