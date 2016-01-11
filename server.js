// server.js

    // set up ========================
    var express  = require('express');
    var app = module.exports = express();                               // create our app w/ express
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var PORT = 80;

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

    app.get('/', function(req, res){
        res.render('index');
    });

    // routes 
    var getController = require('./controllers/shippable.js');
    app.post('/getcount', getController.getcount);

    // listen on port 
    app.listen(PORT, function(){
        console.log('App listening on port', PORT);
    });