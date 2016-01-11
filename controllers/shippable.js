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
        count = 1,
        goNext = false,
        date,
        linkHeader,
        dayCount = 0,
        weekCount = 0;
    
    // username and password for authentication
    var username = "akskas",
    password = "eat2live333";
    
    // json object to store required data for github api call 
    // call is mage per_page parameter which means api will return maximum 100 issues per call
    // state of issues is given as open, to get only open issues
    var options = {
        url: "https://" + username + ":" + password + '@api.github.com/repos/'+ link[1] +'/' + link[2] + '/issues?state=open&per_page=100&page=1',
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
        if (!error && response.statusCode == 200) {
            
            // parse body data
            var info = JSON.parse(body);
            
            // save in array, change date to total milliseconds (ie., starting from 1970)
            for(var i=0; i < info.length; i++){
                date = new Date(info[i].created_at);
                opened.push(date.getTime());
            }
            
            // get link header data and parse 
            linkHeader = parselink(response.headers.link); 
            goNext = false;
            
            // check for next link
            for(var linktype in linkHeader){
                if(linktype == 'next'){
                    // if next link presend, make goNext true for next request, else it will be false
                    goNext = true;    
                }
            }
            
            // if next link present, change url to next url and make the github api call again
            if(goNext){    
                options.url = linkHeader.next.url;
                request(options, callback);
            }
            else{   // if no next url is present, send data as response
                
                // process the created array, to get required issues
                for(var i = 0; i < opened.length; i++){
                    if(opened[i] >= oneDay){
                        dayCount++;
                    }else if(opened[i] < oneDay && opened[i] >= oneWeek){
                        weekCount++;
                    }else{
                        resp.totalCount= opened.length;
                        resp.dayCount= dayCount;
                        resp.weekCount= weekCount;
                        resp.beforeWeekCount= opened.length - weekCount - dayCount;
                        
                        // stop the loop if all the issues within 1 week are known, as we already know the total count
                        i = opened.length;
                    }
                }
                console.log("resp: ", resp);
                
                //send response
                res.send(JSON.stringify(resp));
            }
        }else
            resp.message = error;
            console.log("error: ", error);
//            res.send(JSON.stringify(resp));
    }
    
    // first call to github api
    request(options, callback);   
}

module.exports = {
    getcount: getcount
}