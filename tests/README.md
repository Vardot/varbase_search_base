# Varbase Search Base — automated functional tests

Behaviour-Driven functional tests for the **Varbase Search Base** recipe, part
of the Varbase functional testing suite (Playwright + Cucumber-js). They drive a
running Varbase site through a real browser and assert the behaviour the recipe
actually provides — the `/search` Canvas page, the keyword bar over the search
results, the Content Type facet and its counts, the Date Published exposed
filter, the results pager, and who is allowed to search.

## Layout

```
tests/
├── features/                                 # flat — one recipe, no per-feature subfolders
│   ├── 01-01-search-page.feature                # the page, its parts, and the Search result view mode
│   ├── 02-01-search-by-keyword.feature          # the keyword bar, the empty result, the pager
│   ├── 03-01-content-type-facet.feature         # the facet's options, counts and narrowing
│   ├── 04-01-date-published-filter.feature      # the Date Published groups and the facet counts under them
│   ├── 05-01-search-access.feature              # anonymous and logged-in visitors can search
│   └── 06-01-search-accessibility.feature       # accessibility of each state of the search page
├── step-definitions/
│   └── search.steps.js                       # the keyword bar, the Content Type facet, the
│                                             #   Date Published filter, the results summary
├── selectors/
│   └── selectors.json                        # every selector, under a plain name
└── recipes/
    └── varbase_search_base_test_content/     # a `type: Content` seed recipe: 15 published nodes
                                              #   carrying one keyword — 9 Blog post, 6 Utility page,
                                              #   3 of them authored over a year ago
```

The `NN-NN-` prefix keeps the flat feature files ordered.

The generic `@vardot/varbase-e2e` steps drive everything that is not specific to
this recipe — navigation, links and assertions — so `search.steps.js` stays
small.

## Why the keyword bar needs a step of its own

The search page carries the same exposed filter form three times: the header
search block, the block above the results, and the Date Published rail. Each one
renders a "Search by keyword" field and a submit button, so a label-first
`I fill in "Search by keyword"` matches more than one field and fails on
Playwright's strict mode. `I search for "..."` scopes the fill and the submit
to the results block's own form. None of the forms has an accessible name, so
each one comes from the selector registry by a plain name.

The Content Type facet needs one too: its script puts a checkbox named
"<type> (<count>)" in front of each option link, and the steps read the option
and its count from that name.

So does opening a result. A result renders as a text card whose link covers the
whole card and is named by the title, so it has no box of its own to click.
`I open the "..." search result` focuses that link and presses Enter, the way a
keyboard user opens it.

Every selector lives in `selectors/selectors.json` under a plain name
(`search results form`, `search keywords`, `content type facet`, ...), which
cucumber.js loads for every scenario. Feature files and steps use those names,
and find the controls inside a block by role and accessible name.

## The fixture and its numbers

The scenarios assert exact totals, so the fixture is deterministic:

| Search | Results | Blog post | Utility page |
|---|---|---|---|
| `Varbasesearchtest` | 15 | 9 | 6 |
| `Varbasesearchtest` + Past Year | 12 | 7 | 5 |
| `Varbasesearchsingle` | 1 | 1 | — |

`Varbasesearchtest` is a coined token carried only by the fixture's body text,
so no other content on the site can join the counts. The three nodes authored
over a year ago (`Blog 08`, `Blog 09`, `Page 06`) carry a fixed `created`
timestamp; every other fixture node omits `created` and is authored at import
time, which is what keeps the Date Published assertions true whenever the suite
runs.

The view sorts by relevance only, and the fixture's rows score alike, so their
order within a result set is not fixed. Scenarios assert titles only on result
sets that fit on one page (10 rows); wider sets are asserted by their totals and
facet counts.

## Prerequisites

- A running Varbase site with this recipe applied — the `/search` Canvas page,
  the `search` view's `results_block` and `date_block` displays, and the
  `search_content_type` facet. A stock Varbase Starter site is enough: the page
  is built from Vartheme BS5 components, so no site-template theme is needed.
- The two content types the fixture uses, **Blog post** and **Utility page**,
  which Varbase Starter provides. They are what gives the Content Type facet
  more than one bundle to count.
- The per-role testing users from `cucumber.js` (`Normal user`, `Content
  editor`, `Content admin`, `SEO admin`, `Site admin`, `webmaster`), all on
  password `dD.123123ddd`.
- The test content seeded — a testing-only **recipe** (not a PHP fixture) — and
  then indexed, because nothing is searchable until the index runs and cron may
  not have:

  ```bash
  drush recipe /path/to/tests/recipes/varbase_search_base_test_content
  drush search-api:index
  drush cache:rebuild
  ```

- Antibot uninstalled (or otherwise neutralised) on the test site, as the
  pipeline does: with it installed the login form submit is rejected and every
  logged-in scenario runs as an anonymous visitor.

## Running

```bash
npm install                 # varbase-e2e brings Cucumber-js, Playwright, tsx
npx playwright install chromium

# Point at your running site and run the whole suite:
LAUNCH_URL=https://your-site.ddev.site npm run test:chromium

# A single feature file:
FEATURES="tests/features/03-01-content-type-facet.feature" \
  LAUNCH_URL=https://your-site.ddev.site npm run test:chromium
```

CI installs a Varbase site that applies this recipe, seeds the users and the
test content recipe, fills the search index and runs the whole suite — see
`.gitlab-ci.yml`. `@external` is reserved for scenarios that need a live
third-party service; the suite has none today, and the pipeline runs
`--tags "not @wip and not @external"` so one can be added without touching CI.

Run only the accessibility scenarios with `--tags "@a11y"`. Each state of the
search page (empty, with results, no results, a facet applied, the date filter
applied) is gated on no serious or critical axe violations, and the page with
results runs the full check (axe plus the structural probes). The label probe
does not count a placeholder as a label, which axe does.
