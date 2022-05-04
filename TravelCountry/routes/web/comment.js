var express = require("express");

// use for file upload
var multer = require("multer");
var crypto = require("crypto");
var path = require("path");
// end use for file upload
var ensureAuthenticated = require("../../auth/auth").ensureAuthenticated;

var Comment = require("../../models/comment");

var User = require("../../models/user");

var router = express.Router();

var storage = multer.diskStorage({
    destination: "./views/images/",
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            // crypto take a randome byte, add date and extension name to orignal file   (cb(null) null for error)
            cb(null, raw.toString('hex') + Date.now() + path.extname(file.originalname));
        });
    }
});

// upload call multer with storage parameter
var upload = multer({ storage: storage });
router.use(ensureAuthenticated); // add middleware ensureAuthenticated into entire router in this file

// add middleware function ensureAuthenticated between "/comments" and "function => done
router.get("/", function (req, res) {   // "/", go to the root of the router, which is http://localhost:1337/comments
    // get all the post
    Comment.find({ userID: req.user._id }).exec(function (err, comments) { // call back function returns all the comments under that user
        if (err) { console.log(err); }
        // pass all posts under variable posts so we can use in view comments.ejs
        res.render("comment/comments", { comments: comments });
    });
});

// view comment/addcomment page & get all comments related to user => done
router.get("/add", function (req, res) {
    res.render("comment/addcomment", {form: {
        countryName: "",
        state: [""],
        startDate: "",
        endDate: "",
        tag: "",
        details: "",
        travelFeeling: ""
    }});
}); // handle when click the button "Add new travel experience"

// handle when click "create"
router.post("/add", upload.array('images', 12), function (req, res, next) { // same name as addecipe.name = image
    var fileValidationError;
    const files = req.files;
    const countryName = req.body.countryName;
    const state = req.body.state == null ? [] : req.body.state;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const tag = req.body.tag;
    const details = req.body.details;
    const travelFeeling = req.body.travelFeeling;    
    if (files.length < 1 || files.length > 12) {
            fileValidationError = {
            location: 'files',
            params: 'files',
            msg: 'Please choose at least one image and less than 12 images',
            value: undefined
        }
    }
  
//fields value holder
var form = {
    files,
    countryName,
    state,
    startDate,
    endDate,
    tag,
    details,
    travelFeeling
};

    req.checkBody('countryName', 'Please enter your travel country name').notEmpty();
    req.checkBody('state', 'Please check the state of your travel country').notEmpty();
    req.checkBody('startDate', 'Please enter travel start date').notEmpty().isInt();
    req.checkBody('endDate', 'Please enter your travle ends date').notEmpty().isInt();
    req.checkBody('tag', 'Please enter some tag').notEmpty();
    req.checkBody('details', 'Please write your travel deatils').notEmpty();
    req.checkBody('travelFeeling', 'Please choose your travel Feeling').notEmpty();


 var errors = req.validationErrors();
 if(errors || fileValidationError){
     all_errors = []
     if (errors) {
         all_errors = all_errors.concat(errors);
     }
     if (fileValidationError) {
         all_errors = all_errors.concat([fileValidationError]);
     }
     //console.log(errors)
     console.log(form);
     res.render("comment/addcomment", {error: all_errors, form: form});
 } else{

//Here Success Part Code runs

    var newComment = new Comment({
        countryName: countryName, 
        state: state, 
        startDate:  startDate,
        endDate: endDate,
        tag:  tag,
        details: details,
        travelFeeling:  travelFeeling,
        image: files,
        userID: req.user._id,  // id of the user signed in
    });

    newComment.save(function (err, comment) {
        if (err) { console.log(err); }
        // if not err, go to http://localhost:1337/comments
        res.redirect("/comments");
    });
}
});


router.get("/update/:planId", function (req, res) {
    Comment.findById(req.params.planId).exec(function (err, comment) {
        if (err) { console.log(err); }
        res.render("comment/editcomment", { comment: comment });
    });
});


router.post("/update", upload.array('image', 12), async function (req, res) {
    var input = req.body.vote;

    if(input == "cancel") {
        res.redirect("/comments");
    } else  if(input == "update"){
        const comment = await Comment.findById(req.body.planId);
        var fileValidationError;
        const newFiles = req.files;
        var currentFiles = comment.image;
    
        comment.countryName = req.body.countryName;
        comment.state = req.body.state == null ? [] : req.body.state;
        comment.startDate = req.body.startDate;
        comment.endDate = req.body.endDate;
        comment.tag = req.body.tag;
        comment.details = req.body.details;
        comment.travelFeeling = req.body.travelFeeling;
        comment.userID = req.user._id;
    
        if (newFiles.length > 12) {
            fileValidationError = {
                location: 'files',
                params: 'files',
                msg: 'Please choose at least one image and no more than 12 images',
                value: undefined
            }
        }
    
        if (newFiles.length > 0 && newFiles.length < 13) {
            //handle upload file (use multer)
            comment.image = newFiles; // upload path where file is located
        } else {
            comment.image = currentFiles;
        }
    
        req.checkBody('countryName', 'Please enter your travel country name').notEmpty();
        req.checkBody('state', 'Please check the state of your travel country').notEmpty();
        req.checkBody('startDate', 'Please enter travel start date').notEmpty().isInt();
        req.checkBody('endDate', 'Please enter your travle ends date').notEmpty().isInt();
        req.checkBody('tag', 'Please enter some tag').notEmpty();
        req.checkBody('details', 'Please write your travel deatils').notEmpty();
        req.checkBody('travelFeeling', 'Please choose your travel Feeling').notEmpty();
    
     var errors = req.validationErrors();
     if(errors || fileValidationError){
         all_errors = []
         if (errors) {
             all_errors = all_errors.concat(errors);
         }
         if (fileValidationError) {
             all_errors = all_errors.concat([fileValidationError]);
         }
         res.render("comment/editcomment", {error: all_errors, comment: comment});
     } else{
            res.redirect("/comments/detail/" + req.body.planId);
     }
    }
});


router.get("/delete/:planId", function (req, res) {
    Comment.findByIdAndDelete(req.params.planId).exec(function (err, comment) {
        if (err) { console.log(err); }
        User.find().exec(function (err, users){
            for(var j = 0; j < users.length; j++) {
                var user = users[j];
                var userLike = user.like;
                for (var i = 0; i < userLike.length; i++) {
                    if (userLike[i] ==  req.params.planId) { 
                        userLike.splice(i, 1);                   
                        break;
                    }
                }
                user.like = userLike;
                user.save();
            }
                       
        });
        res.redirect("/comments");
    });
});

// : means a route parameter it could be anything and it's often an ID
router.get("/detail/:planId", function (req, res) {
    Comment.findById(req.params.planId).exec(function (err, comment) {
        if (err) { console.log(err); }
        User.findById(comment.userID).exec(function (err, user) {  // Find username of comment's author
            if (err) { console.log(err); }
            name = user.username;
            res.render("comment/detailcomment", { comment: comment, username: name }); // pass all posts under variable posts so we can use in view comments.ejs
        });
    });
});

router.get("/like/:planId", function (req, res) {
    Comment.findById(req.params.planId).exec(async function (err, comment) {
        if (err) { console.log(err); }
        var currentUser = req.user;
        var currentComment = comment;
        var currentUserLike = currentUser.like;
        var isAlreadyLike = false;
        for (var i = 0; i < currentUserLike.length; i++) {
            if (currentUserLike[i] == req.params.planId) { 
                isAlreadyLike = true;
                break;
            }
        }
        if (!isAlreadyLike) {
            // update user
            currentUser.username = currentUser.username;
            currentUser.email = currentUser.email;
            currentUser.password = currentUser.password;
            currentUser.firstname = currentUser.firstname;
            currentUser.lastname = currentUser.lastname;
            currentUser.createdAt = currentUser.createdAt;
            currentUser.like.push(currentComment._id); 

            // update comments for each country
            comment.countryName = currentComment.countryName;
            comment.state = currentComment.state;
            comment.startDate = currentComment.startDate;
            comment.endDate = currentComment.endDate;
            comment.tag = currentComment.tag;
            comment.details = currentComment.details;
            comment.travelFeeling = currentComment.travelFeeling;
            comment.userID = currentComment.userID;
            comment.image = currentComment.image;
            comment.like = Number(currentComment.like + 1);

            // save user and comments in database
            let saveComment = await comment.save();
            console.log("saveComment", saveComment);
            let saveUser = await currentUser.save();
            console.log("saveUser", saveUser);
        } else {
            console.log("Already liked this travel Comments!");
            req.flash("info", "Already liked this Comments!");
        }
        res.redirect("../../comments/detail/" + req.params.planId);
    });
});

module.exports = router;