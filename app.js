var express = require('express');
var app = express();
var runkey = require("./hidden/runkey.txt");

app.get('/runkey', function (req, res) {
    res.send('Hello World!')
});

app.listen(8081, function () {
    console.log('Listening');
});