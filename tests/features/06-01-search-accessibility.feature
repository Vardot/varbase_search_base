Feature: Search Base - Accessibility of the search page
      As a visitor who uses a screen reader, a keyboard or zoom
      I want the search page to be accessible in every state it can be in
      So that I can search the site and narrow the results like anyone else.

  @a11y @check @local @development @staging @production
  Scenario: The search page before a search has no serious accessibility violations
    Given I am an anonymous user
     When I go to "/search"
      And wait
     Then I should see "Date Published"
      And the page should have no serious accessibility violations

  @a11y @check @local @development @staging @production
  Scenario: Every search field on the search page has an accessible label
    Given I am an anonymous user
     When I go to "/search"
      And wait
     Then I see visible search keywords
      And every form field should have an accessible label

  @a11y @check @local @development @staging @production
  Scenario: The search results have no serious accessibility violations
    Given I am an anonymous user
     When I go to "/search"
      And wait
      And I search for "Varbasesearchtest"
     Then the search results summary should show a total of 15
      And the page should have no serious accessibility violations

  @a11y @check @local @development @staging @production
  Scenario: The search results pass the full accessibility check
    Given I am an anonymous user
     When I go to "/search"
      And wait
      And I search for "Varbasesearchtest"
     Then the search results summary should show a total of 15
      And the page should pass the full accessibility check

  @a11y @check @local @development @staging @production
  Scenario: A search with no results has no serious accessibility violations
    Given I am an anonymous user
     When I go to "/search"
      And wait
      And I search for "Zzzznothingmatchesthis"
     Then I should see "There are no results for your search, please try another query."
      And the page should have no serious accessibility violations

  @a11y @check @local @development @staging @production
  Scenario: The results narrowed by content type have no serious accessibility violations
    Given I am an anonymous user
     When I go to "/search?keywords=Varbasesearchtest"
      And wait
      And I choose the "Blog post" Content Type facet
     Then the search results summary should show a total of 9
      And the page should have no serious accessibility violations

  @a11y @check @local @development @staging @production
  Scenario: The results narrowed by date published have no serious accessibility violations
    Given I am an anonymous user
     When I go to "/search?keywords=Varbasesearchtest"
      And wait
      And I choose the "Past Year" Date Published filter
     Then the "Past Year" Date Published filter should be chosen
      And the search results summary should show a total of 12
      And the page should have no serious accessibility violations
