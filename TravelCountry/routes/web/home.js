var express = require("express");
var passport = require("passport");

var ensureAuthenticated = require("../../auth/auth").ensureAuthenticated;
var multer = require("multer");
var crypto = require("crypto");
var path = require("path");

var User = require("../../models/user"); // the User object would get whatever is being exported from the module in user.js. 
var Comment = require("../../models/comment");

var router = express.Router();

router.get("/", function (req, res) {
    Comment.find().sort({ like: -1}). exec(function (err, comments) {
        if (err) { console.log(err); }
        res.render("home/index", { comments: comments }); // render the homepage, views fold is set to be the root directory
  });
});

router.get("/result", function (req, res) {
    Comment.find().sort({ like: -1}).exec(function (err, comment) {
        if (err) { console.log(err); }
        res.render("home/result", { comments: comment });
  });
});

router.post("/result", function (req, res) {
    var content = req.body.searchContent;
    var reg = new RegExp(content, 'i');
    Comment.find({title : {$regex : reg}}).exec(function (err, comment) {
        if (err) { console.log(err); }
        res.render("home/result", { comments: comment, state  : content.state  });
  });
});

router.get("/result/:state", function (req, res) {
    Comment.find({state : req.params.state }).sort({ like: -1}).exec(function (err, comment) {
        if (err) { console.log(err); }
        res.render("home/result", { comments: comment, state : req.params.state  });
  });
});

router.get("/login", function (req, res) {
    res.render("home/login")
});

router.get("/city", function (req, res) {
    res.render("home/country")
});

router.post("/login", passport.authenticate("login", {
    successRedirect: "/",  // success => direct to the homepage
    failureRedirect: "/login",
    failureFlash: true

}));

router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/"); // url
});


router.get("/signup", function (req, res) {
    res.render("home/signup")
});

router.post("/signup", function (req, res, next) {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var repassword = req.body.repassword;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;

    User.findOne({ email: email }, function (err, user) {
        if (err) { return next(err); }

        if (username == "" || password == "" || repassword == "" || firstname == "" || lastname == "") {
            req.flash("error", "All fields are required!!!");
            return res.redirect("/signup");
        }

        if (user) {
            req.flash("error", "There is already an account with this email");
            return res.redirect("/signup");
        }
        if (password != repassword) {
            req.flash("error", "Password and Re-password are mismatch!");
            return res.redirect("/signup");
        }

        var newUser = new User({
            username: username,
            password: password,
            email: email,
            firstname: firstname,
            lastname: lastname
        });

        newUser.save(next);

    });

}, passport.authenticate("login", {  // use login authenticate strategy defined in setuppassport.js
    successRedirect: "/",
    failureRedirect: "/signup",
    failureFlash: true
}));


router.get("/profile", function (req, res) {
    User.findById(req.user._id, function (err, user) {
        if (err) { console.log(err); }
        var userLike = user.like;
        Comment.find({'_id': { $in: userLike }}, function(err, comments) {
            var commentObj = [];
            for (var i = 0; i < comments.length; i++) {
                var comment = comments[i];
                commentObj.push(comment);
                console.log(comment);
            }
            res.render("user/profile", { user: user, comment: commentObj });
        });
    });
});

router.get("/like/:planId", function (req, res) {
    Comment.findById(req.params.planId).exec(function (err, comment) {
        if (err) { console.log(err); }
        User.findById(comment.userID).exec(function (err, user) {
            if (err) { console.log(err); }   
            name = user.username;
            res.render("home/detail", { comment: comment, username: name ,  info: "Please login to see your like Comments." });
        });
    });

});


// Must be the last one in order for ":" to match
router.get("/home/:planId", function (req, res) {
    Comment.findById(req.params.planId).exec(function (err, comment) {
        if (err) { console.log(err); }
        User.findById(comment.userID).exec(function (err, user) {
            if (err) { console.log(err); }   
            name = user.username;
            res.render("home/detail", { comment: comment, username: name });
        });
    });
});

module.exports = router;
