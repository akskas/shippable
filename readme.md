1. Here, we are calling github's search api with following parameters:
    
    Example: "https://" + username + ":" + password + '@api.github.com/search/issues?q=repo:Shippable/support+is:issue+is:open&&per_page=100&&page=1"
    
    a. search parameters: owner/repository and is a issue and is open
    b. per_page: per request maximum 100 issues can be received
    b  page: page number
    
2. We get the link to next page from response.headers.link
3. Since we have already received total number of open issue, we just make calls for issues that opened within a week
   that way we are making extra calls
4. Now we have issues opened within a week, we jsut get the ones that were openedn within 24 hours

5. Assignment is hosted on: ec2-54-213-140-58.us-west-2.compute.amazonaws.com

6. github repo link is: https://github.com/akskas/shippable


Test Cases are:
1. invalid repo
2. no issues in repo
3. all issues created before 1 week
4. all issues created within 1 week
5. issue are there in all catergories (ie within 24 hrs, between 1 day and 1 week, before 1 week)