var express = require('express'),
    https = require('https'),
    bodyParser = require('body-parser'),
    fs = require('fs');
var app = express();
var runkey = require("./hidden/runkey.txt");

var credentials = { // SSL Credentials
    ca: fs.readFileSync("../www/certbot/fullchain.pem"),
    key: fs.readFileSync("../www/certbot/privkey.pem"),
    cert: fs.readFileSync("../www/certbot/cert.pem")
};

app.use( bodyParser.json() );       // to support JSON-encoded POST bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded POST bodies
    extended: true
}));

app.get('/', function (req, res) {
    res.send("Home Page");
});

app.post('/runkey', function (req, res) {
    res.writeHead(200, {"Content-Type": "application/json"});
    var json = {};
    // If key is valid
    if(req.body.key === runkey) {
        json.ok = true;
    } else {
        json.ok = false;
        json.error = "Invalid key";
    }
    res.send(JSON.stringify(json));
});
app.get('/runkey', function (req, res) {
    res.writeHead(200, {"Content-Type": "application/json"})
   var json = {};
   json.ok = false;
   json.error = "No key";
   res.send(JSON.stringify(json));
});

var server = https.createServer(credentials, app);

server.listen(8081, function () {
    console.log('Listening');
});