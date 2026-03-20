---
layout: home
title: Visual Gallery
description: Browse the canonical design-ui modes, compare them visually on the same scenario, and copy prompts for the separate redesign-skill workflow.
page_class: theme-home-high-agency
---

<section class="shell section" id="intent-split">
  <div class="section-heading stack-md">
    <p class="section-kicker">Intent split</p>
    <h2>Pick by intent first, then browse visually.</h2>
    <p>The main split is not “which style looks nice?”—it is whether you need the canonical UI design skill or the audit-first redesign workflow.</p>
  </div>

  <div class="decision-table-wrapper">
    <table class="decision-table">
      <caption>Decision matrix for frontend design requests</caption>
      <thead>
        <tr>
          <th scope="col">Situation</th>
          <th scope="col">Recommended skill</th>
        </tr>
      </thead>
      <tbody>
        {% for row in site.data.site.decision_matrix %}
          <tr>
            <td>{{ row.situation }}</td>
            <td><code>{{ row.choice }}</code></td>
          </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
</section>

<section class="shell section" id="gallery">
  <div class="section-heading stack-md">
    <p class="section-kicker">Visual gallery</p>
    <h2>Four design-ui modes, one shared workspace scenario.</h2>
    <p>{{ site.data.site.same_scenario.description }} The scenario is <strong>{{ site.data.site.same_scenario.product_name }}</strong>: {{ site.data.site.same_scenario.product_summary }}</p>
  </div>

  <div class="mode-grid gallery-grid">
    {% for mode in site.data.design_ui_modes %}
      {% include mode-card.html mode=mode %}
    {% endfor %}
  </div>
</section>

<section class="shell section" id="workflow-lane">
  <div class="section-heading stack-md">
    <p class="section-kicker">Separate redesign lane</p>
    <h2><code>redesign-skill</code> stays process-oriented.</h2>
    <p>It is intentionally presented outside the style gallery so users do not mistake it for a fifth aesthetic preset.</p>
  </div>

  <div class="redesign-band">
    <div class="redesign-band-copy stack-md">
      <p class="mode-tag">Workflow, not style</p>
      <h3><code>redesign-skill</code></h3>
      <p>{{ site.data.redesign_workflow.summary }}</p>
      <a class="button button-primary" href="{{ '/redesign-skill/' | relative_url }}">Open the workflow page</a>
    </div>
    <div class="redesign-band-preview">
      {% include preview-frame.html
        src=site.data.redesign_workflow.preview_asset
        alt=site.data.redesign_workflow.preview_alt
        caption='Scan → Diagnose → Fix → Verify on an existing product, not a style comparison card.'
        preview_class='preview-shell-process'
      %}
    </div>
  </div>
</section>

<section class="shell section" id="prompt-cookbook">
  <div class="section-heading stack-md">
    <p class="section-kicker">Prompt cookbook</p>
    <h2>Copy the exact skill and mode names.</h2>
    <p>These examples use the canonical names already documented in the repo, so you can paste them directly.</p>
  </div>

  <div class="prompt-grid">
    {% for mode in site.data.design_ui_modes %}
      {% include prompt-card.html prompt_key=mode.prompt_key %}
    {% endfor %}
    {% include prompt-card.html prompt_key=site.data.redesign_workflow.prompt_key wide=true %}
  </div>
</section>

<section class="shell section" id="taxonomy">
  <div class="section-heading stack-md">
    <p class="section-kicker">Design vocabulary / taxonomy</p>
    <h2>Use one primary language, 1–2 supporting treatments, one imagery mode, and an avoid list.</h2>
    <p>This mirrors the shared taxonomy behind <code>design-ui</code> so style prompts stay coherent instead of mixing contradictory signals.</p>
  </div>

  {% assign tax = site.data.taxonomy %}
  <div class="taxonomy-grid taxonomy-grid-cards">
    {% for key in 'primary_language|supporting_treatments|imagery_mode|avoid_list' | split: '|' %}
      {% assign group = tax[key] %}
      <article class="taxonomy-card stack-md">
        <h3>{{ group.title }}</h3>
        {% include taxonomy-chip-list.html items=group.items tone=group.tone %}
      </article>
    {% endfor %}
  </div>
</section>
