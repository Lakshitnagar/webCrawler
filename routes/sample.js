var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.sendFile('views/sample.html', { root: __dirname });
});

module.exports = router;
