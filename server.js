require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const URL = require("./db.js").UrlModel;
const router = express.Router();

const TIMEOUT = 2000;

//// custom middlewares
//app logger
function appLogger(req, res, next) {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
}

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(path = '/', middlewareFunction = appLogger);
app.use(path = '/', middleWareFunction = bodyParser.urlencoded({ extended: "false" }));
app.use(path = '/', middlewareFunction = bodyParser.json());
app.use(path = "/api", router);

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl', function (req, res) {
  res.json(req.body);
});

app.post('/api/shorturl', function (req, res) {
  let parsedUrl = req.body['url'].split(/https:\/\/www.|http:\/\/www./)
  parsedUrl = parsedUrl[parsedUrl.length - 1];
  console.log(parsedUrl);
  dns.lookup(parsedUrl, function (err, address, family) {
    console.log('address: %j family: IPv%s', address, family);
    if (err) {
      res.json({ error: 'invalid url' });
    } else {
      res.json(req.body);
    };
  });
});

const createURL = require("./db.js").createAndSaveURL;
router.post("/test", function (req, res, next) {
  console.log(`req: ${JSON.stringify(req.body)}`);
  var existingUserCount = 0;
  let t = setTimeout(() => {
    next({ message: "timeout" });
  }, TIMEOUT);

  URL.count({}, function (err, count) {
    existingUserCount = count;
    console.log(`in count ${existingUserCount}`);
  })

  let newUrlData = {
    original_url: req.body['url'],
    short_url: existingUserCount + 1
  }
  
  console.log(newUrlData);

  createURL(newUrlData, function (err, data) {
    clearTimeout(t);
    if (err) return next(err);
    if (!data) {
      console.log("Can't save data!");
      return next({ message: "creaAndSaveURL can't save data! check JSON input." });
    }

    URL.count({}, function (err, count) {
      console.log("Number of users before create:", existingUserCount);
      console.log("Number of users:", count);
    })

    URL.findById(data._id, function (err, urldata) {
      if (err) return next(err);
      res.json(urldata);
      URL.deleteMany({}, function (err, urldata) {
        if (err) return next(err);
        console.log(`Model deleted entirely: ${JSON.stringify(urldata)}`);
      })
    });
  })
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
