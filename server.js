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

const createURL = require("./db.js").createAndSaveURL;
router.post("/shorturl", function (req, res, next) {
  var existingUserCount = 0;
  var newUrlData = {};
  let t = setTimeout(() => {
    next({ message: "timeout" });
  }, TIMEOUT);

  let parsedUrl = req.body['url'].split(/https:\/\/www.|http:\/\/www./)

  if (parsedUrl.length < 2) {
    res.json({ error: 'invalid url' });
  } else {
    parsedUrl = parsedUrl[parsedUrl.length - 1];
    dns.lookup(parsedUrl, function (err, address, family) {
      console.log('address: %j family: IPv%s', address, family);
      if (err) {
        res.json({ error: 'invalid url' });
      } else {
        clearTimeout(t);
        URL.countDocuments({})
          .then(count => {
            existingUserCount = count;
            return existingUserCount;
          })
          .then(existingUserCount => {
            URL.find({ 'original_url': req.body["url"] }, function (err, urlData) {
              if (err) return next(err);
            }).clone().exec()
              .then(dataOut => {
                if (dataOut.length !== 0) {
                  res.json({
                    original_url: dataOut[0]['original_url'],
                    short_url: dataOut[0]['short_url']
                  });
                } else {
                  newUrlData = {
                    original_url: req.body["url"],
                    short_url: existingUserCount + 1
                  };
                  createURL(newUrlData, function (err, data) {
                    if (err) return next(err);
                    if (!data) {
                      console.log("Can't save data!");
                      return next({ message: "creaAndSaveURL can't save data! check JSON input." });
                    }

                    URL.findById(data._id, function (err, urlData) {
                      if (err) return next(err);
                      res.json({
                        original_url: urlData['original_url'],
                        short_url: parseInt(urlData['short_url'])
                      });
                    });
                  })
                }
              })
              .catch(err => {
                next(err);
              })
          })
          .catch(err => {
            next(err);
          });
      };
    });
  }
}).get('/shorturl/:urlshort', function (req, res, next) {
  let t = setTimeout(() => {
    next({ message: "timeout" });
  }, TIMEOUT);

  URL.find({ 'short_url': req.params['urlshort'] }, function (err, urlData) {
    clearTimeout(t);
    if (err) return next(err);
    console.log("URL DATA: ", urlData.length);
    if (urlData.length < 1) {
      res.json({ 'error': 'Wrong format' });
      next();
    } else {
      // res.json(urlData);
      res.redirect(urlData[0]['original_url']);
      next();
    }
  })
});

router.get('/deleteAll', function (req, res, next) {
  URL.deleteMany({}, function (err, urlData) {
    if (err) return next(err);
    res.json({
      recordsDeleted: urlData['deletedCount']
    });
    next();
  })
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
