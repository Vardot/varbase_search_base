# Changelog

All notable changes to the Varbase Search Base recipe are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.2] - 2026-09-21
### Fixed
- Do not ship the Canvas search page from a base recipe; the site template
  ships it. The page's components exist only once a theme is installed, and
  this recipe installs none, so a fresh install failed
  ([#3624848](https://www.drupal.org/i/3624848)).

## [1.0.1] - 2026-09-21
### Added
- Ship the search results Canvas page at `/search`, the Content Type facet, the
  Date Published grouped exposed filter, the Search result view mode, and the
  automated functional testing suite
  ([#3624824](https://www.drupal.org/i/3624824)).
- Depend on `drupal_cms_search`, which owns the search view and the content
  index this recipe acts on, plus `facets` and `better_exposed_filters`
  ([#3624824](https://www.drupal.org/i/3624824)).

## [1.0.0] - 2026-09-08
### Added
- First release of the Varbase Search Base recipe.
- Ship the `node.search_index` view mode
  ([#3617240](https://www.drupal.org/i/3617240)).
### Fixed
- Temporarily remove Ultimate Cron until it has a stable release
  ([#3621494](https://www.drupal.org/i/3621494)).

[Unreleased]: https://git.drupalcode.org/project/varbase_search_base/-/compare/1.0.2...1.0.x
[1.0.2]: https://git.drupalcode.org/project/varbase_search_base/-/compare/1.0.1...1.0.2
[1.0.1]: https://git.drupalcode.org/project/varbase_search_base/-/compare/1.0.0...1.0.1
[1.0.0]: https://git.drupalcode.org/project/varbase_search_base/-/commits/1.0.0
