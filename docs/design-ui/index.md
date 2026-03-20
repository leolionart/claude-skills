---
layout: default
title: design-ui switchboard
description: design-ui is one canonical skill with four demo microsites that re-render the same pseudo-product in different visual modes.
page_class: theme-gallery-high-agency
---

<section class="shell section hero hero-home">
  <div class="hero-copy stack-lg">
    <p class="section-kicker">Canonical frontend design skill</p>
    <h1><code>design-ui</code> is one skill with four demo modes.</h1>
    <p class="lead">Use this hub as the switchboard for the canonical <code>design-ui</code> skill. Each route below is a dedicated microsite demo of the same pseudo-product, so you can compare how one skill shifts its design language across four renderings.</p>
    <div class="hero-actions">
      <a class="button button-primary" href="#mode-switchboard">Enter the mode switchboard</a>
      <a class="button button-secondary" href="{{ '/redesign-skill/' | relative_url }}">Switch to audit-first workflow</a>
    </div>
  </div>

  <div class="hero-panel surface-card stack-md">
    <p class="meta-label">Shared demo rule</p>
    <h2>{{ site.data.site.same_scenario.title }}</h2>
    <p><strong>{{ site.data.site.same_scenario.product_name }}</strong> is the shared pseudo-product: {{ site.data.site.same_scenario.product_summary }}</p>
    <p>That keeps comparisons honest. The routes below are not separate skills—they are four visual renderings of one canonical skill, comparing typography, spacing, palette, depth, motion pacing, and composition on the same product scenario.</p>
  </div>
</section>

<section class="shell section section-tight" id="mode-switchboard">
  <div class="section-heading stack-md">
    <p class="section-kicker">Mode switchboard</p>
    <h2>Choose the rendering of <code>design-ui</code> you want to demo.</h2>
    <p>Every route below is an immersive static microsite for the same Northstar Workspace scenario. Pick the page whose visual language best matches your brief, then copy the canonical prompt from inside that mode.</p>
  </div>

  <div class="mode-grid gallery-grid">
    {% for mode in site.data.design_ui_modes %}
      {% include mode-card.html mode=mode %}
    {% endfor %}
  </div>
</section>

<section class="shell section section-tight">
  <div class="mode-scenario-band stack-md">
    <p class="section-kicker">What changes across the four demos</p>
    <h2>The scenario stays fixed. The design language changes.</h2>
    <p>This hub exists so users can compare one canonical skill under four visual interpretations of the same product: not four unrelated examples, and not four top-level skills competing with each other.</p>
    <div class="chip-band" aria-label="Compare axes across the four design-ui demos">
      {% for axis in site.data.site.same_scenario.compare_axes %}
        <span>{{ axis }}</span>
      {% endfor %}
    </div>
  </div>
</section>

<section class="shell section section-tight">
  <div class="legacy-panel stack-md">
    <p class="section-kicker">Separate workflow lane</p>
    <h2><code>redesign-skill</code> is not a fifth mode.</h2>
    <p>{{ site.data.site.same_scenario.workflow_handoff.summary }}</p>
    <a class="text-link" href="{{ site.data.site.same_scenario.workflow_handoff.cta_url | relative_url }}">{{ site.data.site.same_scenario.workflow_handoff.cta_label }}</a>
  </div>
</section>
