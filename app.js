var express = require('express'),
    https = require('https'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    path = require('path');
var app = express();
var runkey = require("./hidden/runkey.js").runkey;

process.title = "forumalerts"; // Change the Linux process name

var maintenance = false; // Bool for whether or not the service is under maintenance. Setting this to true
                         // will send a notification letting people know and disable the application temporarily

var credentials = { // SSL Credentials
    key: fs.readFileSync("/etc/certificates/bugg.co/private-key.pem"),
    cert: fs.readFileSync("/etc/certificates/bugg.co/cert.pem")
};

// Set static content
app.use(express.static(path.join(__dirname, 'static'), {maxAge: 7 * 24 * 60 * 60 * 1000}));

app.use(bodyParser.json());       // to support JSON-encoded POST bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded POST bodies
    extended: true
}));

var server = https.createServer(credentials, app);

server.listen(2083, function () {
    console.log('Listening');
});

app.get('/', function (req, res) {
    res.header({"Access-Control-Allow-Origin": "*"});
    res.render()
});

app.all('/runkey', function (req, res) {
    res.header({"Access-Control-Allow-Origin": "*"});
    var json = {maintenance: false};
    if(maintenance) {
        json.ok = false;
        json.error = "System undergoing maintenance.";
        json.maintenance = true;
    } else {
        // If key is valid
        if (typeof req.body.key === "undefined") {
            json.ok = false;
            json.error = "No key";
        } else {
            if (req.body.key === runkey) {
                json.ok = true;
            } else {
                json.ok = false;
                json.error = "Invalid key";
            }
        }
    }
    res.json(json);
});