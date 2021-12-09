require('dotenv').config();


var mongoose = require('mongoose');
const uri = process.env.MONGO_URI;
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const { Schema } = mongoose;

const urlSchema = new Schema({
    original_url: String,
    short_url: String
});

let UrlModel = mongoose.model('UrlModel', urlSchema);

const createAndSaveURL = (inputJSON, done) => {
    let newURL = new UrlModel(inputJSON);
    newURL.save(function (err, data) {
        if (err) return done(err);
        done(null, data);
    });
};

const findOneByOriginalURL = (originalurlidx, done) => {
    UrlModel.findOne({ short_url: originalurlidx }, function (err, docs) {
        if (err) return done(err);
        done(null, docs);
    })
};

const findOneByShortURL = (shorturlidx, done) => {
    UrlModel.findOne({ short_url: shorturlidx }, function (err, docs) {
        if (err) return done(err);
        done(null, docs);
    })
};

const removeByShortURL = (shorturlidx, done) => {
    UrlModel.findByIdAndRemove(personId, function (err, docs) {
        if (err) return done(err);
        done(null, docs);
    })
};

/** **Well Done !!**
/* You completed these challenges, let's go celebrate !
 */

//----- **DO NOT EDIT BELOW THIS LINE** ----------------------------------

exports.UrlModel = UrlModel;
exports.createAndSaveURL = createAndSaveURL;
exports.findOneByOriginalURL = findOneByOriginalURL;
exports.findOneByShortURL = findOneByShortURL;
exports.removeByShortURL = removeByShortURL;