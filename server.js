// https://curl.trillworks.com/#node

// for payant.ng

// demo public key 8710f4d26a1d552c3de5d6781d5fd9b6b75b28dd

// demo private key cc6e6f66530b722efc59aa673aa3fe7452be67277086f12d4762f776


var express = require('express');
var http = require('http');
var request = require('request');

var session = require('express-session');
var app = express();
var server = http.Server(app);

server.listen(8081, function () { // auto change port if port is already in use, handle error gracefully
    console.log('node server listening on port :8081');
});

app.use(session({
    secret: '"xiooi-=-09R$NDJ&("]]csd90',
    resave: false,
    saveUninitialized: true
}));


app.get('/', function (req, res) {
    
    res.type('html');
    res.contentType('*/*');
    res.sendFile(__dirname + '/index.html');
    
});


// --

var headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer cc6e6f66530b722efc59aa673aa3fe7452be67277086f12d4762f776'
};

var dataString = '{ "settlement_bank": "058", "account_number": "0123456789" }';

var options = {
    url: 'https://api.demo.payant.ng/resolve-account',
    method: 'POST',
    headers: headers,
    body: dataString
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log('body:', body);
    } else {
        console.error('err:', error);
    }
}

request(options, callback);

// -


request(options = {
    url: 'https://api.payant.ng/banks',
    headers: headers
}, callback);

