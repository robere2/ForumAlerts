var express = require('express'),
    https = require('https'),
    bodyParser = require('body-parser'),
    fs = require('fs');
var app = express();
var runkey = require("./hidden/runkey.js").runkey;

var credentials = { // SSL Credentials
    ca: fs.readFileSync("../www/certbot/fullchain.pem"),
    key: fs.readFileSync("../www/certbot/privkey.pem"),
    cert: fs.readFileSync("../www/certbot/cert.pem")
};

app.use(bodyParser.json());       // to support JSON-encoded POST bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded POST bodies
    extended: true
}));

var server = https.createServer(credentials, app);

server.listen(8081, function () {
    console.log('Listening');
});


app.get('/', function (req, res) {
    res.send("Home Page");
});

app.post('/runkey', function (req, res) {
    var json = {};
    // If key is valid
    console.log("Key: " + req.body.key);
    if(req.body.key === runkey) {
        json.ok = true;
    } else {
        json.ok = false;
        json.error = "Invalid key";
    }
    res.json(json);
});
app.get('/runkey', function (req, res) {
    var json = {};
    json.ok = false;
    json.error = "No key";
    res.json(json);
});