// cucumber-js configuration for the Varbase Search Base functional testing suite.
//
// Drives the search recipe through the browser (Playwright + Cucumber-js via
// varbase-e2e >= 2.0.4). Feature files live flat in tests/features/ — one recipe,
// no per-feature subfolders.
//   yarn test                # all features (tests/features/*.feature)
//   yarn test:chromium       # force chromium
//   yarn test:headed         # headed debug run
//   FEATURES="tests/features/02-01-search-by-keyword.feature" yarn test:chromium
//
// Point the suite at a running site with LAUNCH_URL (falls back to
// DDEV_PRIMARY_URL). Reports land in tests/reports/. Disable the auto HTML hook
// with VARBASE_E2E_REPORT_DISABLE=1 and run `yarn generate-reports` in CI instead.

module.exports = {
  default: {
    // Cucumber step timeout must exceed Playwright's default 30s so the
    // try/catch wrappers in the step files surface a friendly Playwright
    // error before cucumber's raw "function timed out".
    timeout: 60000,
    // Retry once. Late scenarios occasionally trip a step/assertion timeout
    // purely from cumulative load on a heavy Varbase site (not a real defect).
    // One retry absorbs those transient timeouts. Override with --retry N.
    retry: 1,
    // tsx/cjs registers a require() hook so cucumber-js loads both `.js`
    // and `.ts` step files with no build step.
    requireModule: ['tsx/cjs'],
    require: [
      'node_modules/@vardot/varbase-e2e/tests/step-definitions/**/*.js', // Varbase E2E core step definitions.
      'tests/step-definitions/**/*.js',                         // Search Base custom step definitions.
    ],
    // FEATURES lets you run a single feature file (e.g.
    // FEATURES="tests/features/02-01-search-by-keyword.feature"); unset runs the
    // whole flat suite.
    paths: [process.env.FEATURES || 'tests/features/*.feature'],
    format: [
      '@cucumber/pretty-formatter',
        'summary',
      'json:tests/reports/' + (process.env.CUCUMBER_JSON || 'cucumber_report') + '.json',
    ],
    formatOptions: {
      theme: {
        'feature keyword': ['bold', 'blue'],
        'feature name': ['blue', 'underline'],
        'scenario keyword': ['bold', 'magenta'],
        'scenario name': ['magenta', 'underline'],
        'step keyword': ['bold', 'green'],
        'step text': ['greenBright', 'italic'],
      },
    },
    worldParameters: {
      launchUrl: process.env.LAUNCH_URL || process.env.DDEV_PRIMARY_URL || 'https://localhost',
      // Per-role testing users, keyed by human role name. Seeded on the site by
      // `ddev init-minimal-automated-testing` (add-testing-users). Step text
      // references users by these labels, so they must stay in sync with the
      // seeded accounts.
      users: {
        "webmaster": {
          "username": "webmaster",
          "email": "webmaster@vardot.com",
          "password": "dD.123123ddd"
        },
        "Normal user": {
          "email": "test.authenticated@vardot.com",
          "password": "dD.123123ddd"
        },
        "Content editor": {
          "email": "test.content_editor@vardot.com",
          "password": "dD.123123ddd"
        },
        "Content admin": {
          "email": "test.content_admin@vardot.com",
          "password": "dD.123123ddd"
        },
        "SEO admin": {
          "email": "test.seo_admin@vardot.com",
          "password": "dD.123123ddd"
        },
        "Site admin": {
          "email": "test.site_admin@vardot.com",
          "password": "dD.123123ddd"
        },
        "Super admin": {
          "email": "test.super_admin@vardot.com",
          "password": "dD.123123ddd"
        }
      },
      minWaitTime: {
        // Per-navigation settle budget. The search page renders a Canvas page,
        // a views results block, a facet block and two exposed filter forms, so
        // give it room to settle before the next assertion runs.
        page: 8000,
        before_scenario: 0,
        after_scenario: 0,
        before_step: 0,
        after_step: 0,
      },
      selectors: {
        css: {},
        xpath: {},
        filesPath: './tests/selectors/',
        files: [],
        offset: 60,
        breakpoints: {
          xs:   { width: 375,  height: 667  },
          sm:   { width: 576,  height: 800  },
          md:   { width: 768,  height: 1024 },
          lg:   { width: 992,  height: 768  },
          xl:   { width: 1200, height: 900  },
          xxl:  { width: 1400, height: 900  },
          xxxl: { width: 1920, height: 1080, default: true },
        },
      },
      screenshot: {
        dir: './tests/screenshots',
        purge: false,
        onFailed: true,
        onEveryStep: false,
        alwaysFullscreen: false,
        failedPrefix: 'failed_',
        filenamePattern: '{datetime}.{feature_file}.feature_{step_line}.{ext}',
        filenamePatternFailed: '{failed_prefix}{datetime}.{feature_file}.feature_{step_line}.{ext}',
        infoTypes: '',
      },
      video: {
        // 'off' | 'on' | 'on-failure' | 'tag'. Override per run with VARBASE_E2E_VIDEO.
        mode: process.env.VARBASE_E2E_VIDEO || 'on-failure',
        dir: './tests/videos',
        size: { width: 1920, height: 1080 },
        filenamePattern: '{datetime}.{feature_file}.{scenario}.{status}.{ext}',
      },
      javascript: {
        // Report collected JavaScript console/page errors at scenario end.
        // 'warn' logs but the scenario still passes; do NOT tag scenarios
        // @javascript (that forces 'fail' mode in varbase-e2e).
        mode: process.env.VARBASE_E2E_JS_ERROR_MODE || 'warn',
        levels: ['error'],
        ignore: '',
        beforeScenario: false,
        afterScenario: true,
      },
    },
  },
};
