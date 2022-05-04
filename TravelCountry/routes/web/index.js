var express = require("express");

var router = express.Router(); // use express router which is stored in variable router

// add currentUser object
router.use(function (req, res, next) {
    // create currentUser, error, info to use in _header.ejs
    res.locals.currentUser = req.user;   
    res.locals.error = req.flash("error");
    res.locals.info = req.flash("info");

    next(); // move to the next line
});

//use router
router.use("/", require("./home")); // if on "/" path, use home.js routing file 
router.use("/comments", require("./comment")); // when go to /comments, use comment router file
module.exports = router;   
