// FLWSECK_TEST-aeab0c72b5207a5c1de76023ecd73c62-X

// FLWPUBK_TEST-d5a78c2b35917bfd5ae94fec1c751c57-X

// FLWSECK_TEST96b1ae5fb5e0


const forge    = require('node-forge');
const request = require('request-promise-native');
const md5 = require('md5');
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 15, // Default: 0
    host: 'localhost', // def change to connarts.com.ng before deployment
    user: 'connarts_ossai',
    password: "ossai'spassword",
    database: 'connarts_nysc',
    acquireTimeout: 1800000, // 10000 is 10 secs
    multipleStatements: true // it allows for SQL injection attacks if values are not properly escaped
  });
  
  pool.on('acquire', function (connection) {
    console.log('Connection to DB with threadID %d acquired', connection.threadId);
  });
var options = {
	url: "",
	method: "",
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json'
	},
	body: {
		"PBFPubKey": "",
		"alg": "3DES-24",
		client: "",
	},
	json: true
}

class Rave {
	/**
	 * Rave object constructor
	 * @param {*} public_key This is a string that can be found in merchant rave dashboard
	 * @param {*} secret_key This is a string that can be found in merchant rave dashboard
	 */
	constructor(public_key, secret_key){
        this.public_key = public_key;
        this.secret_key = secret_key;
    }

	encryptCardDetails(card_details) {
        card_details = JSON.stringify(card_details);
        let cipher   = forge.cipher.createCipher('3DES-ECB', forge.util.createBuffer(this.getKey()));
        cipher.start({iv:''});
        cipher.update(forge.util.createBuffer(card_details, 'utf-8'));
        cipher.finish();
        let encrypted = cipher.output;
        return ( forge.util.encode64(encrypted.getBytes()) );
	}

	getKey() {
        let sec_key = this.secret_key;
        let keymd5 = md5(sec_key);
        let keymd5last12 = keymd5.substr(-12);

        let seckeyadjusted = sec_key.replace('FLWSECK-', '');
        let seckeyadjustedfirst12 = seckeyadjusted.substr(0, 12);

        return seckeyadjustedfirst12 + keymd5last12;
	}

	initiatePayment(card_details) {
		return new Promise((resolve, reject) => {
			let encrypted_card_details = this.encryptCardDetails(card_details);
			let payment_options = Object.assign({}, options);
			payment_options.url = 'https://ravesandboxapi.flutterwave.com/flwv3-pug/getpaidx/api/charge';
			payment_options.body.client = encrypted_card_details;
            payment_options.method = 'POST';
            payment_options.body.PBFPubKey = this.public_key; // set public key

			request(payment_options)
				.then((result) => {
					resolve(result);
				}).catch((err) => {
					reject(err);
				});
		})
	}
}

var rave = new Rave('FLWPUBK_TEST-d5a78c2b35917bfd5ae94fec1c751c57-X','FLWSECK_TEST-aeab0c72b5207a5c1de76023ecd73c62-X');

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
app.use(express.static('assets'));
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




app.get('/', function (req, res) {
    res.type('html');
    res.contentType('*/*');
    res.sendFile(__dirname + '/index.html');    
});

app.get('/login', function (req, res) {
    res.type('html');
    res.contentType('*/*');
    res.sendFile(__dirname + '/new look/login.html');    
});

app.get('/register', function (req, res) {
    res.type('html');
    res.contentType('*/*');
    res.sendFile(__dirname + '/register.html');    
});

app.get('/dashboard', function (req, res) {
    res.type('html');
    res.contentType('*/*');
    res.sendFile(__dirname + '/dashboard.html');    
});

app.post('/chargecard', bodyParser.urlencoded({ extended: true/* , type: 'application/x-www-form-urlencoded' */ }), function (req, res) {
    console.log('the message:', req.body);

    console.log('\n\n\n\n\t', req);

    console.log('\n\n\n\n\t', req.headers);
    
    rave.initiatePayment({
        "cardno": req.body.cardno, // "5531886652142950",
        "cvv": req.body.cvv, // "890",
        "expirymonth": "09",
        "expiryyear": "22",
        "currency": "NGN",
        "pin": req.body.pin, // "3310",
        "country": "NG",
        "amount": req.body.amount, // "1000",
        "email": req.session.email, // "nwachukwuossai@gmail.com",
        "suggested_auth": "PIN",
        "phonenumber": req.session.phonenumber, // "09055469670",
        "firstname": req.session.firstname, // "temi",
        "lastname": req.body.lastname, // "desola",
        "IP": "",
        "txRef": "MC-" + Date.now(),
        "redirect_url": "https://rave-webhook.herokuapp.com/receivepayment",
        "meta": [{metaname: "flightID", metavalue: "123949494DC"}],
        "device_fingerprint": "", // "69e6b7f0b72037aa8428b70fbe03986c"
      }).then(result => {
          console.log('result:', result);
          res.send('okay');
        })
        .catch(error => console.log('error:', error));
    
  });

  app.post('/createvirtualcard', bodyParser.urlencoded({ extended: true/* , type: 'application/x-www-form-urlencoded' */ }), function (req, res) {
    console.log('the message:', req.body);

    var newvirtualcard_options = {
        url: "https://api.ravepay.co/v2/services/virtualcards/new",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: {
            "secret_key":"FLWSECK_TEST-aeab0c72b5207a5c1de76023ecd73c62-X",
            "currency": "NGN", // || "USD",
            "amount": "100", // 10 USD = 100 NGN
            "billing_name": "Mohammed Lawal",
            "billing_address": "DREAM BOULEVARD",
            "billing_city": "ADYEN",
            "billing_state": "NEW LANGE",
            "billing_postal_code": "293094",
            "billing_country": "NG", // || "US",
          "callback_url": "https://your-callback-url.com/"
        },
        json: true
    }

    request(newvirtualcard_options)
        .then((result) => {
            // note Capitalized Status and lowercase status
            result.status == "success"; // 200 OK [Card created successfully, save the response to database]
            result.Status == "Failed"; // 200 Failed callback when a card is used
            result.Status == "Successful"; // 200 Successful callback when a card is used
            resolve(result);
        }).catch((err) => {
            reject(err);
        });
  });

  function fundVirtualCard(id, amount, debit_currency) { // This is id returned for the card. You can pick this up from the Create a Virtual Card API response.
    var fundvirtualcard_options = {
        url: "https://api.ravepay.co/v2/services/virtualcards/fund",
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
        url: "https://api.ravepay.co/v2/services/virtualcards/transactions",
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
        url: "https://api.ravepay.co/v2/services/virtualcards/get",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: {
			"secret_key":"FLWSECK-e6db11d1f8a6208de8cb2f94e293450e-X",
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
        url: 'https://api.ravepay.co/v2/services/virtualcards/card_id/status/status_action' };

        request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
        });
       */

      var freezeorunfreezevirtualcard_options = {
        url: "https://api.ravepay.co/v2/services/virtualcards/" + card_id + "/status/" + status_action,
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