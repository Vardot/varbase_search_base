Feature: Search Base - Searching by keyword
      As a site visitor
      I want the keyword bar to search the site's content
      So that I only see the content that matches what I typed.

  @check @local @development @staging @production
  Scenario: A keyword returns the content that carries it
    Given I am an anonymous user
     When I go to "/search"
      And wait
      And I search for "Varbasesearchtest"
     Then the search results summary should show a total of 15
      And ".view-id-search.view-display-id-results_block .views-row" should have a count of 10 within 10 seconds

  @check @local @development @staging @production
  Scenario: A keyword only one item carries narrows the results to that item
    Given I am an anonymous user
     When I go to "/search"
      And wait
      And I search for "Varbasesearchsingle"
     Then the search results summary should show a total of 1
      And the search results should include "Varbase Example Search Blog 07"
      And the search results should not include "Varbase Example Search Blog 01"

  @check @local @development @staging @production
  Scenario: A keyword nothing carries says so
    Given I am an anonymous user
     When I go to "/search"
      And wait
      And I search for "Zzzznothingmatchesthis"
     Then I should see "There are no results for your search, please try another query."
      And the search results should not include "Varbase Example Search Blog 01"

  @check @local @development @staging @production
  Scenario: A search opens the page of the content it found
    Given I am an anonymous user
     When I go to "/search?keywords=Varbasesearchsingle"
      And wait
      And I follow "Varbase Example Search Blog 07"
      And wait
     Then the response status code should be 200
      And I should see "Varbase Example Search Blog 07"

  @check @local @development @staging @production
  Scenario: The results pager carries the visitor past the first page
    Given I am an anonymous user
     When I go to "/search?keywords=Varbasesearchtest"
      And wait
     Then I should see text matching "1 - 10 of 15"
      And ".pager__items" should be visible
     When I go to "/search?keywords=Varbasesearchtest&page=1"
      And wait
     Then I should see text matching "11 - 15 of 15"
      And ".view-id-search.view-display-id-results_block .views-row" should have a count of 5 within 10 seconds
