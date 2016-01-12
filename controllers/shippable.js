'use strict';

// request package for making http/https request 
var request = require('request');

// parse-link-header package for parsing the link to get next and last api urls
// as the link returned by api is in the format: '<https://api.github.com/user/9287/repos?page=3&per_page=100>; rel="next", ...
var parselink = require('parse-link-header');


// method invoked when route is called
var getcount = function(req, res){
    var link = req.body.link;
    console.log("link: ", req.body.link);
    
    // split link to get owner and repository name
    link = link.split('//');
    link = link[1].split('/');
    
    // get current time 
    var now = Date.now();
    var oneDay = now - 1000*60*60*24,
        oneWeek = now - 1000*60*60*24*7;
    
    var opened = [],     // array to store created_at times of issues
        totalCount = 0,
        goNext = false,
        date,
        linkHeader,
        dayCount = 0,
        getOneWeek = true;
    
    // username and password for authentication
    var username = "someuser",
    password = "somepassword";
    
    // json object to store required data for github api call 
    // call is mage per_page parameter which means api will return maximum 100 issues per call
    // state of issues is given as open, to get only open issues
    
    // https://api.github.com/search/issues?q=repo:octocat/Hello-World+is:issue+is:open&&per_page=100&&page=1
    var options = {
        url: "https://" + username + ":" + password + '@api.github.com/search/issues?q=repo:'+ link[1] +'/' + link[2] + '+is:issue+is:open&&per_page=100&&page=1',
        headers: {
            'User-Agent': 'request',
        },
        method: 'GET'
    };
    
    // create and initialize response variable for client, need to be sent after completion of request
    var resp = {
        totalCount: 0,
        dayCount: 0,
        weekCount: 0,
        beforeWeekCount: 0,
        message: "success"
    };
    
    // callback function, called after api request
    function callback(error, response, body) {
        // check for error and statusCode for api call 
        console.log("error: " + error + " statusCode: " + response.statusCode);
        if (!error && response.statusCode == 200) {
            body = JSON.parse(body);
            // get total count
            if(totalCount == 0){
                totalCount = body.total_count;
                console.log("total count: ", totalCount);
            }
            // get items from body
            var info = body.items;
            // save in array, change date to total milliseconds (ie., starting from 1970)
            for(var i=0; i < info.length; i++){
                date = new Date(info[i].created_at);
                if(date.getTime() >= oneWeek){
                    opened.push(date.getTime());
                }else{
                    getOneWeek = false;
                    i = info.length;
                }
            }
            
            // get link header data and parse 
            linkHeader = parselink(response.headers.link); 
            console.log("linkHeader: ", linkHeader);
            goNext = false;
            
            // check for next link
            for(var linktype in linkHeader){
                if(linktype == 'next'){
                    // if next link presend, make goNext true for next request, else it will be false
                    goNext = true;    
                }
            }
            
            // if next link present, change url to next url and make the github api call again
            if(goNext && getOneWeek){    
                options.url = linkHeader.next.url;
                request(options, callback);
            }
            else{   // if no next url is present, send data as response
                
                // process the created array, to get required issues
                for(var i = 0; i < opened.length; i++){
                    if(opened[i] >= oneDay){
                        dayCount++;
                    }else{
                        resp.totalCount= totalCount;
                        resp.dayCount= dayCount;
                        resp.weekCount= opened.length - dayCount;
                        resp.beforeWeekCount= totalCount - opened.length;
                        
                        // stop the loop if all the issues within 1 week are known, as we already know the total count
                        i = opened.length;
                    }
                }
                
                // in case all issues were opened before 1 week,
                // opened array will be empty, so change response values
                if(opened.length == 0){
                    resp.totalCount= totalCount;
                    resp.beforeWeekCount= totalCount;
                }
                console.log("resp: ", resp);
                
                //send response
                res.send(JSON.stringify(resp));
            }
        }else{
            resp.message = response.statusCode;
            console.log("error: ", error);
            res.send(JSON.stringify(resp)); 
        }
    }
    
    // first call to github api
    request(options, callback);   
}

module.exports = {
    getcount: getcount
}