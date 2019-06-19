// for rave.flutterwave.com

// FLWSECK_TEST-aeab0c72b5207a5c1de76023ecd73c62-X

// FLWPUBK_TEST-d5a78c2b35917bfd5ae94fec1c751c57-X

// FLWSECK_TEST96b1ae5fb5e0

// ---------for rave.flutterwave.com

/// ...we'd be using the ravesandbox for now

// for ravesandbox.flutterwave.com

// FLWSECK-26e7c0b3aa54290f3359c127701a1640-X

// FLWPUBK-9cd4c40991322af027613870bc4af472-X

// 26e7c0b3aa546f209678029c

// ---------for ravesandbox.flutterwave.com

/**
 * https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
 * 
 * Meanwhile we can have one function that checks for all 'empties' like null, undefined, '', ' ', {}, [].
 */

var isEmpty = function (data) {
    if (typeof data === 'object') {
        if (JSON.stringify(data) === '{}' || JSON.stringify(data) === '[]') {
            return true;
        } else if (!data) {
            return true;
        }
        return false;
    } else if (typeof data === 'string') {
        if (!data.trim()) {
            return true;
        }
        return false;
    } else if (typeof data === 'undefined') {
        return true;
    } else {
        return false;
    }
};

const forge = require('node-forge');
const request = require('request-promise-native');
const md5 = require('md5');
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 15, // Default: 0
    host: 'localhost', // def change to connarts.com.ng before deployment
    user: 'connarts_ossai',
    password: "ossai'spassword",
    database: /* 'connarts_paperless' ||  */'paperless',
    acquireTimeout: 1800000, // 10000 is 10 secs
    multipleStatements: true // it allows for SQL injection attacks if values are not properly escaped
});

pool.on('acquire', function (connection) {
    console.log('Connection to DB with threadID %d acquired', connection.threadId);
});

var Ravepay = require('ravepay');

var rave = new Ravepay('FLWPUBK-9cd4c40991322af027613870bc4af472-X', 'FLWSECK-26e7c0b3aa54290f3359c127701a1640-X', false);
// var rave = new Rave('FLWPUBK-9cd4c40991322af027613870bc4af472-X', 'FLWSECK-26e7c0b3aa54290f3359c127701a1640-X');

var bodyParser = require('body-parser');
var morgan = require('morgan');
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();
app.use(session({
    secret: '"xiooi-=-[W$##%%]$NDJ&("]]csd90',
    resave: false,
    saveUninitialized: true
}));
app.enable('trust proxy', true);

const expressip = require('express-ip');
app.use(expressip().getIpInfoMiddleware);
// set morgan to log info about our requests for development use.
// app.use(morgan('dev'));


var multer = require('multer');
// var upload = multer();

// using path module removes the buffer object from the req.files array of uploaded files,... in case we ever need this... info!
var path = require('path');
var upload = multer({
    dest: /* path.join(__dirname, '/img') */ '/img' // using path.join(__dirname, '/img') adds extra gibbrish
    // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

app.use(express.static('assets'));

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// for parsing multipart/form-data
app.use(upload.array());


app.set('view engine', 'ejs');
// The app.locals object has properties that are local variables within the application.
app.locals.title = 'paperless';
// => 'My App'

app.locals.email = 'chuks@paperless.com.ng';
// => 'me@myapp.com'

var server = http.Server(app);

server.listen(60581, function () { // auto change port if port is already in use, handle error gracefully
    console.log('node server listening on port :60581');
});

// io connects to the server
var io = require('socket.io')(server);


app.get('/', function (req, res) {
    res.type('html');
    res.contentType('*/*');
    res.sendFile(__dirname + '/login.html');
});

app.get('/login', function (req, res) {
    res.type('html');
    res.contentType('*/*');
    res.sendFile(__dirname + '/login.html');
});

app.get('/register', function (req, res) {
    res.type('html');
    res.contentType('*/*');
    res.sendFile(__dirname + '/register.html');
});

app.get('/dashboard', function (req, res) {
    if (!req.session.loggedin) {
        res.redirect('/login');
    } else {
        res.type('html');
        res.contentType('*/*');
        res.sendFile(__dirname + '/dashboard.html');
    }

});

app.get('/widgets', function (req, res) {
    if (!req.session.loggedin) {
        res.redirect('/login');
    } else {
        res.type('html');
        res.contentType('*/*');
        res.sendFile(__dirname + '/widgets.html');
    }

});

app.get('/elements', function (req, res) {
    res.type('html');
    res.contentType('*/*');
    res.sendFile(__dirname + '/elements.html');
});

app.get('/cards', function (req, res) {
    res.type('html');
    res.contentType('*/*');
    res.sendFile(__dirname + '/cards.html');
});

app.post('/register', bodyParser.urlencoded({ extended: true/* , type: 'application/x-www-form-urlencoded' */ }), function (req, res) {
    console.log('what we got: ', req.body);
    var sqlquery = "INSERT INTO people( phone_number, password, email) VALUES ('" + req.body.phonenumber + "', '" + req.body.password + "', '" + (req.body.email ? req.body.email : '') + "')";
    pool.query(sqlquery, function (error, results, fields) {
        console.log('inserted data from: ', results);
        if (error) throw error;
        // connected!
        if (results.affectedRows === 1) {
            req.session.user = req.body;
            req.session.loggedin = true;
            console.log('Done');
            res.redirect('/widgets'); // res.redirect('/dashboard');
        }
    });

});


app.post('/login', bodyParser.urlencoded({ extended: true }), function (req, res/*, handleRedirect*/) {
    // handle post request, validate data with database.
    // how to handle wrong password with right email or more rearly, right password and wrong password.

    console.log('seeing ...', req.body.phonenumber, req.body.password);
    var sqlquery = `SELECT * FROM people WHERE phone_number = '${req.body.phonenumber}' AND password = '${req.body.password}' `;
    pool.query(sqlquery, function (error1, results1, fields1) {

        if (error1) throw error1;
        // connected!
        if (isEmpty(results1)) {
            // res.sendStatus(406);
            // res.status(403);
            console.log('empty results1', results1, sqlquery);
            res.status(502).redirect(req.headers.referer.substring(22));
        } else if (results1.length === 1) {

            console.log('selected data from db, logging In...', results1, results1[0], isEmpty(results1)); // error sometimes, maybe when there's no db conn: ...

            console.log('req.session.id: ', req.session.id);
            /* // insert login time and session id into db for usage details
            pool.query("INSERT INTO session_usage_details( statecode, session_id, user_agent) VALUES ('" + req.body.statecode + "', '" + req.session.id + "', '" + req.headers["user-agent"] + "')", function (error2, results2, fields2) {

                if (error2) throw error2;

                if (results2.affectedRows === 1) {
                    req.session.loggedin = true;

                    res.redirect('/dashboard');
                }

            }); */
            req.session.phonenumber = req.body.phonenumber;
            req.session.loggedin = true;
            res.redirect('/widgets?' + req.body.phonenumber);
        }
    });


});



var payers = io.of('/');
payers.on('connection', function (socket) {
    socket.on('chargecard', (data, name, fn) => {
        
        rave.Card.charge(
            {
                "cardno": data.cardno,
                "cvv": data.cvv,
                "expirymonth": data.expirymonth,
                "expiryyear": data.expiryyear,
                "currency": "NGN",
                "country": "NG",
                "amount": data.amount, // "1000",
                "email": data.email, // "nwachukwuossai@gmail.com",
                // "suggested_auth": "PIN",
                "phonenumber": data.phonenumber, // "09055469670",
                "firstname": data.firstname, // "temi",
                "lastname": data.lastname, // "desola",
                "IP": /* socket.request.header['x-forwarded-for'] || */ socket.request.connection.remoteAddress,
                "txRef": "MC-" + Date.now(),
                "redirect_url": "https://rave-webhook.herokuapp.com/receivepayment",
                "meta": [{ metaname: "flightID", metavalue: "123949494DC" }],
                "device_fingerprint": "N/A",
            }
        ).then(resp => {
            console.log('>>> resp.body', resp.body);
            socket.resp = resp.body;
            // resp.body.data.chargeResponseMessage
            // res.status(200).send(resp.body.data.chargeResponseMessage);
            socket.emit('otpmessage', { message: resp.body.data.chargeResponseMessage });

        }).catch(err => {
            console.log('\nerr', err);
        })
        fn('woot ' , name , data);
    });

    socket.on('otpresponse', (data, name, fn) => {
        // this funtion will run in the client to show/acknowledge the server has gotten the message.
        rave.Card.validate({
            "transaction_reference": socket.resp.data.flwRef,
            "otp": data.otp
        }).then(response => {
            console.log('\n\n\t==',response.body, '\n\n\n.tx:', response.body.data.tx);
            if (response.body.status == 'success' && response.body.data.data.responsemessage == "successful") {
                console.log('we just got paid !');
                socket.emit('paid', { message: 'Successful payment' });
            }

        });
        fn('woot ' , name , data);
    });
});
app.post('/chargecard', function (req, res) {
    console.log('\n\nthe message:', req.body, `and phone number ${req.session.phonenumber}`);

    rave.Card.charge(
        {
            "cardno": req.body.cardno,
            "cvv": req.body.cvv,
            "expirymonth": req.body.expirymonth,
            "expiryyear": req.body.expiryyear,
            "currency": "NGN",
            "country": "NG",
            "amount": req.body.amount, // "1000",
            "email": req.body.email, // "nwachukwuossai@gmail.com",
            // "suggested_auth": "PIN",
            "phonenumber": req.session.phonenumber, // "09055469670",
            "firstname": req.body.firstname, // "temi",
            "lastname": req.body.lastname, // "desola",
            "IP": req.header['x-forwarded-for'] || req.connection.remoteAddress,
            "txRef": "MC-" + Date.now(),
            "redirect_url": "https://rave-webhook.herokuapp.com/receivepayment",
            "meta": [{ metaname: "flightID", metavalue: "123949494DC" }],
            "device_fingerprint": "N/A",
        }
    ).then(resp => {
        console.log('>>> resp.body', resp.body);

        // resp.body.data.chargeResponseMessage
        // res.status(200).send(resp.body.data.chargeResponseMessage);
        payers.emit('otpmessage', { message: resp.body.data.chargeResponseMessage });
        payers.on('connection', function (socket) {
            socket.on('otpresponse', (data, name, fn) => {
                // this funtion will run in the client to show/acknowledge the server has gotten the message.
                rave.Card.validate({
                    "transaction_reference": resp.body.data.flwRef,
                    "otp": data.otp
                }).then(response => {
                    console.log('\n\n\n.tx:', response.body.data.tx);
                    if (response.body.status == 'success' && response.body.data.amount > 99) {
                        console.log('we just got paid !');


                        fn('woot ' + name + asf);
                        res.send('>>>>>>>>>>>>>>>>>>>');
                    }

                });

            });
        });

        async function otp() {
            const otp = await waitForOTP();
            console.log('the otp:', otp);

        }
        // otp();


    }).catch(err => {
        console.log('\nerr', err);

    })


});

app.post('/createvirtualcard', bodyParser.urlencoded({ extended: true/* , type: 'application/x-www-form-urlencoded' */ }), function (req, res) {
    console.log('the message:', req.body);
    console.log('how much ?', (req.body.billingcurrency ? '100' : '10'));

    console.log();

    var newvirtualcard_options = {
        url: "https://ravesandboxapi.flutterwave.com/v2/services/virtualcards/new",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: {
            "secret_key": "FLWSECK-26e7c0b3aa54290f3359c127701a1640-X",
            "currency": (req.body.billingcurrency ? 'NGN' : 'USD'), // "NGN", // || "USD",
            "amount": (req.body.billingcurrency ? '132090' : '102320'), // "100", // 10 USD = 100 NGN [NGN max is  1,000,000]
            "billing_name": req.body.name,
            "billing_address": req.body.address,
            "billing_city": req.body.city,
            "billing_state": req.body.state,
            "billing_postal_code": req.body.postalcode,
            "billing_country": req.body.country, // "NG", // || "US",
            "callback_url": "http://localhost:60581/widgets"
        },
        json: true
    }

    request(newvirtualcard_options)
        .then((result) => {
            // note Capitalized Status and lowercase status
            // result.status == "success"; // 200 OK [Card created successfully, save the response to database]
            // result.Status == "Failed"; // 200 Failed callback when a card is used
            // result.Status == "Successful"; // 200 Successful callback when a card is used

            // resolve(result);
            console.log('good success', result);
        }).catch((err) => {
            // reject(err);
            console.log('bad report', err);
        });

    res.redirect(req.headers.referer.substring(22));
    // res.send('okay');
});

function fundVirtualCard(id, amount, debit_currency) { // This is id returned for the card. You can pick this up from the Create a Virtual Card API response.
    var fundvirtualcard_options = {
        url: "https://ravesandboxapi.flutterwave.com/v2/services/virtualcards/fund",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: {
            "id": id, // "660bae3b-333c-410f-b283-2d181587247f",
            "amount": amount, // "20",
            "debit_currency": debit_currency, // "NGN" || "USD",
            "secret_key": "FLWSECK-e6db11d1f8a6208de8cb2f94e293450e-X"
        },
        json: true
    }

    request(fundvirtualcard_options)
        .then((result) => {
            // note Capitalized Status and lowercase status
            result.Status == "success"; // 200 OK
            resolve(result);
        }).catch((err) => {
            reject(err);
        });
}


function fetchCardTransactions(id, begin_date, end_date, debit_currency) { // This is id returned for the card. You can pick this up from the Create a Virtual Card API response.
    var fetchcardtransactions_options = {
        url: "https://ravesandboxapi.flutterwave.com/v2/services/virtualcards/transactions",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: {
            "FromDate": begin_date, // "2018-02-13",
            "ToDate": end_date, // "2019-12-21",
            "PageIndex": 0,
            "PageSize": 20,
            "CardId": id, // "105c55f1-b69f-4915-b8e1-d2f645cd9955",
            "secret_key": "FLWSECK-xxxxxxxxxxxxxxxxxxxxxxxx-X"
        },
        json: true
    }

    request(fetchcardtransactions_options)
        .then((result) => {
            // 200 OK
            resolve(result);
        }).catch((err) => {
            reject(err);
        });
}


function getVirtualCard(id) { // This is id returned for the card. You can pick this up from the Create a Virtual Card API response.
    var getvirtualcard_options = {
        url: "https://ravesandboxapi.flutterwave.com/v2/services/virtualcards/get",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: {
            "secret_key": "FLWSECK-e6db11d1f8a6208de8cb2f94e293450e-X",
            "id": id // "660bae3b-333c-410f-b283-2d181587247f"
        },
        json: true
    }

    request(getvirtualcard_options)
        .then((result) => {
            // 200 OK
            // result.status == "success"
            resolve(result);
        }).catch((err) => {
            reject(err);
        });
}


function freezeOrUnfreezeVirtualCard(card_id, status_action) { // status_action = (block || unblock)
    /**
     * var request = require("request");

      var options = { method: 'POST',
      url: 'https://ravesandboxapi.flutterwave.com/v2/services/virtualcards/card_id/status/status_action' };

      request(options, function (error, response, body) {
      if (error) throw new Error(error);

      console.log(body);
      });
     */

    var freezeorunfreezevirtualcard_options = {
        url: "https://ravesandboxapi.flutterwave.com/v2/services/virtualcards/" + card_id + "/status/" + status_action,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        json: true
    }

    request(freezeorunfreezevirtualcard_options)
        .then((result) => {
            // 200 OK
            // result.status == "success"
            resolve(result);
        }).catch((err) => {
            reject(err);
        });
}


function chargeBankAccount(params) {
    rave.initiatePayment({
        "PBFPubKey": "FLWPUBK-7adb6177bd71dd43c2efa3f1229e3b7f-X",
        "accountbank": "232",// get the bank code from the bank list endpoint.
        "accountnumber": "0061333471",
        "currency": "NGN",
        "payment_type": "account",
        "country": "NG",
        "amount": "100", // amount must be greater than NGN100 -- maybe only for GTB and FirstBank
        "email": "desola.ade1@gmail.com",
        "passcode": "09101989",//customer Date of birth this is required for Zenith bank account payment. and pass it in this format DDMMYYYY.
        "bvn": "12345678901",
        "phonenumber": "0902620185",
        "firstname": "temi",
        "lastname": "desola",
        "IP": "355426087298442",
        "txRef": "MC-0292920", // merchant unique reference
        "device_fingerprint": "69e6b7f0b72037aa8428b70fbe03986c"
    }).then(result => {
        console.log('result:', result);
        res.send('okay');
    })
        .catch(error => console.log('error:', error));
}












// --- always last
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that! Go back")
});