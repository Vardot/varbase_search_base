'use strict';

const { When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const assert = require('assert');

const { smartSettle, friendly } = require('@vardot/varbase-e2e/tests/step-definitions/varbase-e2e');

// -----------------------------------------------------------------------------
// Custom steps for the Varbase Search Base recipe.
//
// The generic varbase-e2e steps navigate, assert text and press buttons, so
// those are not re-implemented here. What IS here is what only this recipe
// needs:
//
//   - the keyword bar. The search page carries the SAME exposed filter form
//     three times (the header search block, the results block above the
//     results, and the Date Published rail), so every one of them has a
//     "keywords" input and a submit button. A label-first "I fill in" step
//     matches all three and fails on strict mode; these steps scope each
//     action to one form by its data-drupal-selector, which stays stable
//     however many copies Drupal renders.
//   - the Content Type facet — its options, their counts, and choosing one.
//   - the Date Published exposed filter, a grouped radio set in its own block.
//   - the results summary and the result titles, read from the results block
//     only, so a match anywhere else on the page cannot pass a scenario.
//
// SAFETY: every step acts on a verified, specific element inside the search
// page's own blocks and fails with a plain-English message when that element
// is not there — no "first form on the page" fallbacks.
// -----------------------------------------------------------------------------

// The search page renders a Canvas page, a views results block, a facet block
// and two exposed filter forms. On a loaded machine a submit plus its settle
// can outlast varbase-e2e's 45s default, which reports a slow-but-working page
// as a product failure. 90s still fails a step that is genuinely stuck.
setDefaultTimeout(90000);

const RESULTS_FORM = 'form[data-drupal-selector="views-exposed-form-search-results-block"]';
const DATE_FORM = 'form[data-drupal-selector="views-exposed-form-search-date-block"]';
const RESULTS_VIEW = '.view-id-search.view-display-id-results_block';
const FACET_BLOCK = '.block-facet-blocksearch-content-type';

const budgetOf = (world) => (world.minWaitTime && world.minWaitTime.page) || 8000;

/**
 * Resolve one of the search page's blocks, failing plainly when it is absent.
 */
async function requireLocator(page, selector, what, hint) {
  const locator = page.locator(selector).first();
  if (!(await locator.count())) {
    throw friendly(`Could not find ${what} on "${page.url()}".`, hint);
  }
  return locator;
}

/**
 * Read the results summary line ("Displaying 1 - 10 of 15 results").
 */
async function resultsSummaryText(page) {
  const view = await requireLocator(
    page,
    RESULTS_VIEW,
    'the search results block',
    'Open /search and run a search first — the results block renders only on the search page.'
  );
  return ((await view.innerText()) || '').replace(/\s+/g, ' ').trim();
}

/**
 * Collect the Content Type facet options as { label, count } pairs.
 */
async function facetOptions(page) {
  return page.$$eval(`${FACET_BLOCK} a[data-drupal-facet-item-value]`, (links) =>
    links.map((link) => ({
      label: (link.querySelector('.facet-item__value') || link).textContent.trim(),
      value: link.getAttribute('data-drupal-facet-item-value'),
      filter: link.getAttribute('data-drupal-facet-filter-value'),
      count: Number(link.getAttribute('data-drupal-facet-item-count')),
    }))
  );
}

/**
 * Search from the keyword bar above the results.
 *
 * Fills the "keywords" input of the results block's exposed filter form and
 * presses that form's own submit button, so the header search block and the
 * Date Published rail — which carry the same field — are left alone.
 *
 * Example #1: When I search for "Varbasesearchtest"
 * Example #2: And I search for "Varbasesearchsingle"
 * Example #3: When we search for "Varbase Example Search Blog 07"
 * Example #4: And I search for "Zzzznothingmatchesthis"
 * Example #5: Given I search for "Varbasesearchtest"
 */
When(/^(?:I |we )*search for "([^"]*)"$/, async function (keywords) {
  const form = await requireLocator(
    this.page,
    RESULTS_FORM,
    'the search keyword bar',
    'Go to "/search" before searching — the keyword bar is a block on that page.'
  );
  const input = form.locator('input[name="keywords"]').first();
  await input.fill(keywords);
  await form.locator('input[type="submit"], button[type="submit"]').first().click();
  await smartSettle(this.page, budgetOf(this));
});

/**
 * Assert the total the results summary reports.
 *
 * Example #1: Then the search results summary should show a total of 15
 * Example #2: And the search results summary should show a total of 9
 * Example #3: Then the search results summary should show a total of 1
 * Example #4: And the search results summary should show a total of 12
 * Example #5: Then the search results summary should show a total of 6
 */
Then(/^the search results summary should show a total of (\d+)$/, async function (total) {
  const text = await resultsSummaryText(this.page);
  const match = text.match(/Displaying\s+\d+\s*-\s*\d+\s+of\s+(\d+)\s+results/i);
  if (!match) {
    throw friendly(
      `The search results block on "${this.page.url()}" shows no result summary.`,
      `It reads: "${text.slice(0, 200)}".`
    );
  }
  assert.strictEqual(
    Number(match[1]),
    Number(total),
    `Expected the search to report ${total} results, but it reports ${match[1]} ("${match[0]}").`
  );
});

/**
 * Assert a title is (or is not) among the search results.
 *
 * Example #1: Then the search results should include "Varbase Example Search Blog 01"
 * Example #2: And the search results should include "Varbase Example Search Page 01"
 * Example #3: Then the search results should not include "Varbase Example Search Page 06"
 * Example #4: And the search results should not include "Varbase Example Search Blog 09"
 * Example #5: Then the search results should include "Varbase Example Search Blog 07"
 */
Then(/^the search results should( not)? include "([^"]*)"$/, async function (negate, title) {
  const text = await resultsSummaryText(this.page);
  const found = text.includes(title);
  if (negate) {
    assert.ok(!found, `Expected "${title}" NOT to be among the search results, but it is.`);
  } else {
    assert.ok(found, `Expected "${title}" among the search results, but it is not.`);
  }
});

/**
 * Assert a Content Type facet option and its count.
 *
 * Example #1: Then the Content Type facet should offer "Blog post" with a count of 9
 * Example #2: And the Content Type facet should offer "Utility page" with a count of 6
 * Example #3: Then the Content Type facet should offer "Blog post" with a count of 7
 * Example #4: And the Content Type facet should offer "Utility page" with a count of 5
 * Example #5: Then the Content Type facet should offer "Blog post" with a count of 1
 */
Then(
  /^the Content Type facet should offer "([^"]*)" with a count of (\d+)$/,
  async function (label, count) {
    await requireLocator(
      this.page,
      FACET_BLOCK,
      'the Content Type facet block',
      'The facet renders only when the search has results — search for something first.'
    );
    const options = await facetOptions(this.page);
    const option = options.find((item) => item.label === label);
    assert.ok(
      option,
      `Expected the Content Type facet to offer "${label}", but it offers ${
        options.length ? options.map((item) => `"${item.label}" (${item.count})`).join(', ') : 'nothing'
      }.`
    );
    assert.strictEqual(
      option.count,
      Number(count),
      `Expected the Content Type facet to count ${count} for "${label}", but it counts ${option.count}.`
    );
  }
);

/**
 * Assert the Content Type facet offers nothing — the state before a search,
 * when there are no results to build facet options from.
 *
 * Example #1: Then the Content Type facet should offer no content types
 * Example #2: And the Content Type facet should offer no content types
 * Example #3: Then the Content Type facet should offer no content types
 * Example #4: And the Content Type facet should offer no content types
 * Example #5: Then the Content Type facet should offer no content types
 */
Then(/^the Content Type facet should offer no content types$/, async function () {
  const options = (await this.page.locator(FACET_BLOCK).count()) ? await facetOptions(this.page) : [];
  assert.strictEqual(
    options.length,
    0,
    `Expected no Content Type facet options, but the facet offers ${options
      .map((item) => `"${item.label}" (${item.count})`)
      .join(', ')}.`
  );
});

/**
 * Narrow the results by clicking one Content Type facet option.
 *
 * Example #1: When I choose the "Blog post" Content Type facet
 * Example #2: And I choose the "Utility page" Content Type facet
 * Example #3: When we choose the "Blog post" Content Type facet
 * Example #4: And we choose the "Utility page" Content Type facet
 * Example #5: Given I choose the "Blog post" Content Type facet
 */
When(/^(?:I |we )*choose the "([^"]*)" Content Type facet$/, async function (label) {
  await requireLocator(
    this.page,
    FACET_BLOCK,
    'the Content Type facet block',
    'The facet renders only when the search has results — search for something first.'
  );
  const options = await facetOptions(this.page);
  const option = options.find((item) => item.label === label);
  if (!option) {
    throw friendly(
      `The Content Type facet offers no "${label}" option.`,
      `It offers ${options.map((item) => `"${item.label}"`).join(', ') || 'nothing'}.`
    );
  }
  // The checkbox widget's JavaScript hides the facet link and puts a real
  // checkbox in front of it, so the link is there but unclickable. Check the
  // checkbox when it is there, and fall back to the link when the widget's
  // JavaScript has not run.
  const checkbox = this.page
    .locator(`${FACET_BLOCK} input.facets-checkbox[value="${option.filter}"]`)
    .first();
  if ((await checkbox.count()) && (await checkbox.isVisible().catch(() => false))) {
    await checkbox.check();
  } else {
    await this.page.locator(`${FACET_BLOCK} a[data-drupal-facet-item-value="${option.value}"]`).first().click();
  }
  await this.page.waitForURL(/f%5B0%5D=|f\[0\]=/, { timeout: 30000 }).catch(() => {});
  await smartSettle(this.page, budgetOf(this));
});

/**
 * Choose one option of the Date Published grouped exposed filter.
 *
 * The filter is a radio set in its own block, with Better Exposed Filters
 * auto-submit on, so choosing an option reloads the results by itself.
 *
 * Example #1: When I choose the "Past Year" Date Published filter
 * Example #2: And I choose the "Past 24 Hours" Date Published filter
 * Example #3: When we choose the "Past Week" Date Published filter
 * Example #4: And I choose the "- Any -" Date Published filter
 * Example #5: Given I choose the "Past Month" Date Published filter
 */
When(/^(?:I |we )*choose the "([^"]*)" Date Published filter$/, async function (label) {
  const form = await requireLocator(
    this.page,
    DATE_FORM,
    'the Date Published filter',
    'Go to "/search" first — the Date Published filter is a block on that page.'
  );
  const radio = form.getByRole('radio', { name: label, exact: true }).first();
  if (!(await radio.count())) {
    throw friendly(
      `The Date Published filter offers no "${label}" option.`,
      'The recipe ships "- Any -", "Past 24 Hours", "Past Week", "Past Month" and "Past Year".'
    );
  }
  const before = this.page.url();
  await radio.check();
  // Better Exposed Filters submits the form 500ms after the choice, which is a
  // full navigation. When that auto-submit is off, the form's own submit button
  // is hidden (js-hide), so submit the form itself rather than clicking it.
  try {
    await this.page.waitForURL((url) => url.toString() !== before, { timeout: 10000 });
  } catch {
    await form.evaluate((element) => element.submit());
    await this.page.waitForLoadState('load').catch(() => {});
  }
  await smartSettle(this.page, budgetOf(this));
});

/**
 * Assert which Date Published option is currently chosen.
 *
 * Example #1: Then the "Past Year" Date Published filter should be chosen
 * Example #2: And the "- Any -" Date Published filter should be chosen
 * Example #3: Then the "Past Month" Date Published filter should be chosen
 * Example #4: And the "Past Week" Date Published filter should be chosen
 * Example #5: Then the "Past 24 Hours" Date Published filter should be chosen
 */
Then(/^the "([^"]*)" Date Published filter should be chosen$/, async function (label) {
  const form = await requireLocator(
    this.page,
    DATE_FORM,
    'the Date Published filter',
    'Go to "/search" first — the Date Published filter is a block on that page.'
  );
  const radio = form.getByRole('radio', { name: label, exact: true }).first();
  assert.ok(await radio.count(), `The Date Published filter offers no "${label}" option.`);
  assert.ok(
    await radio.isChecked(),
    `Expected the "${label}" Date Published option to be chosen, but it is not.`
  );
});
