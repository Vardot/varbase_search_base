Feature: Search Base - The Date Published filter
      As a site visitor looking at search results
      I want a Date Published filter
      So that I can leave out content published before the period I care about.

  @check @local @development @staging @production
  Scenario: Past Year leaves out the content authored over a year ago
    Given I am an anonymous user
     When I go to "/search?keywords=Varbasesearchtest"
      And wait
     Then the search results summary should show a total of 15
     When I choose the "Past Year" Date Published filter
     Then the "Past Year" Date Published filter should be chosen
      And the search results summary should show a total of 12

  @check @local @development @staging @production
  Scenario: The Content Type facet counts follow the Date Published filter
    Given I am an anonymous user
     When I go to "/search?keywords=Varbasesearchtest"
      And wait
      And I choose the "Past Year" Date Published filter
     Then the Content Type facet should offer "Blog post" with a count of 7
      And the Content Type facet should offer "Utility page" with a count of 5

  @check @local @development @staging @production
  Scenario: The content authored over a year ago is the content Past Year leaves out
    Given I am an anonymous user
     When I go to "/search?keywords=Varbasesearchtest&published=4"
      And wait
      And I choose the "Blog post" Content Type facet
     Then the search results summary should show a total of 7
      And the search results should include "Varbase Example Search Blog 01"
      And the search results should not include "Varbase Example Search Blog 08"
      And the search results should not include "Varbase Example Search Blog 09"

  @check @local @development @staging @production
  Scenario: Any brings the older content back
    Given I am an anonymous user
     When I go to "/search?keywords=Varbasesearchtest&published=4"
      And wait
     Then the search results summary should show a total of 12
     When I choose the "- Any -" Date Published filter
     Then the search results summary should show a total of 15
     When I choose the "Blog post" Content Type facet
     Then the search results summary should show a total of 9
      And the search results should include "Varbase Example Search Blog 08"
      And the search results should include "Varbase Example Search Blog 09"
