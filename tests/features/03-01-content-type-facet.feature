Feature: Search Base - The Content Type facet
      As a site visitor looking at search results
      I want a Content Type facet with counts
      So that I can narrow the results to the kind of content I am after.

  @check @local @development @staging @production
  Scenario: The facet offers each content type in the results with its count
    Given I am an anonymous user
     When I go to "/search?keywords=Varbasesearchtest"
      And wait
     Then the search results summary should show a total of 15
      And the Content Type facet should offer "Blog post" with a count of 9
      And the Content Type facet should offer "Utility page" with a count of 6

  @check @local @development @staging @production
  Scenario: Choosing a content type narrows the results to it
    Given I am an anonymous user
     When I go to "/search?keywords=Varbasesearchtest"
      And wait
      And I choose the "Blog post" Content Type facet
     Then the search results summary should show a total of 9
      And the search results should include "Varbase Example Search Blog 01"
      And the search results should not include "Varbase Example Search Page 01"

  @check @local @development @staging @production
  Scenario: Choosing the other content type narrows the results to that one
    Given I am an anonymous user
     When I go to "/search?keywords=Varbasesearchtest"
      And wait
      And I choose the "Utility page" Content Type facet
     Then the search results summary should show a total of 6
      And the search results should include "Varbase Example Search Page 01"
      And the search results should not include "Varbase Example Search Blog 01"

  @check @local @development @staging @production
  Scenario: A search with one result faces only that result's content type
    Given I am an anonymous user
     When I go to "/search?keywords=Varbasesearchsingle"
      And wait
     Then the Content Type facet should offer "Blog post" with a count of 1
