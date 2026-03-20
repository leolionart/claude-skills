---
layout: default
title: design-ui archive
description: Lean archive page for the four canonical design-ui demo modes behind the homepage gallery.
page_class: page-design-ui-archive
---
{% assign support = site.data.site.support_pages.design_ui %}

<section class="shell section switchboard-front-door design-ui-archive-hero">
  <div class="switchboard-hero-copy stack-lg">
    <div class="stack-md">
      <p class="section-kicker">{{ support.eyebrow }}</p>
      <h1>{{ support.title }}</h1>
      <p class="lead">{{ support.summary }}</p>
    </div>

    <div class="hero-actions">
      <a class="button button-primary" href="{{ support.primary_cta.url | relative_url }}">{{ support.primary_cta.label }}</a>
      <a class="button button-secondary" href="{{ support.secondary_cta.url | relative_url }}">{{ support.secondary_cta.label }}</a>
    </div>
  </div>

  <aside class="design-ui-chooser-note stack-sm">
    <p class="meta-label">{{ support.note_title }}</p>
    <p>{{ support.note_body }}</p>
  </aside>
</section>

<section class="shell section section-reference">
  <div class="mode-grid switchboard-grid design-ui-archive-grid">
    {% for mode in site.data.design_ui_modes %}
      {% include mode-card.html mode=mode showcase=true variant='landing' %}
    {% endfor %}
  </div>
</section>
