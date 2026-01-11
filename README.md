# Varbase Search Base

A recipe to manage default installed modules, configs and permissions for Varbase search functionality using Search API.

This recipe provides a complete search setup including:
- Core Drupal search functionality
- Search API for advanced search capabilities
- Database-based search server configuration
- Cron job management for search indexing

## Features

### Search API Integration
- **Search API**: Provides a framework for building custom search solutions
- **Search API DB**: Database-based search backend for sites without Solr or Elasticsearch
- **Database Server**: Pre-configured database server with partial matching and autocomplete support

### Search Configuration
- Minimum 3 characters for search
- Partial matching enabled for better search results
- Autocomplete support with suffix and word suggestions

### Cron Management
- **Ultimate Cron**: Configurable cron job for search indexing
- Pre-configured search API cron handler

## Permissions

The recipe configures search permissions for the following roles:
- **Anonymous**: Basic search content access
- **Authenticated**: Basic search content access

## Installation

Add the recipe using composer:
```
composer require drupal/varbase_search_base:~1.0.0
```

Change directory to `/web` or `/docroot`

Run the Drupal recipe bash script:
```
bash core/scripts/drupal recipe recipes/contrib/varbase_search_base
```

or

Run the Drush recipe command:
```
drush recipe recipes/contrib/varbase_search_base
```

## Maintainers

- [Vardot](https://www.drupal.org/vardot)

## License

GPL-2.0-or-later
