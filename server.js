require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const URL = require("./db.js").UrlModel;
const router = express.Router();

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
app.use("/api",() => {}, router);

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


app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
