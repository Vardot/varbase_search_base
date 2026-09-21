Feature: Search Base - The search page
      As a site visitor
      I want a search page with a keyword bar, results, a Content Type facet and
      a Date Published filter
      So that I can find content on the site and narrow down what I find.

  @check @local @development @staging @production
  Scenario: The search page is published at /search for an anonymous visitor
    Given I am an anonymous user
     When I go to "/search"
      And wait
     Then the response status code should be 200
      And I should see "Search"
      And I should see "Content Type"
      And I should see "Date Published"

  @check @local @development @staging @production
  Scenario: The search page offers the keyword bar and the Date Published options
    Given I am an anonymous user
     When I go to "/search"
      And wait
     Then "form[data-drupal-selector='views-exposed-form-search-results-block'] input[name='keywords']" should be visible within 10 seconds
      And "form[data-drupal-selector='views-exposed-form-search-date-block']" should be visible within 10 seconds
      And I should see "- Any -"
      And I should see "Past 24 Hours"
      And I should see "Past Week"
      And I should see "Past Month"
      And I should see "Past Year"
      And the "- Any -" Date Published filter should be chosen

  @check @local @development @staging @production
  Scenario: The search page lists nothing and faces nothing until a keyword is given
    Given I am an anonymous user
     When I go to "/search"
      And wait
     Then the Content Type facet should offer no content types
      And I should not see "Varbase Example Search Blog 01"

  @check @local @development @staging @production
  Scenario: The recipe's Search result view mode is there for a site builder
    Given I am a logged in user with the "webmaster" user
     When I go to "/admin/structure/display-modes/view"
      And wait
     Then the response status code should be 200
      And the response should contain "Search result"
