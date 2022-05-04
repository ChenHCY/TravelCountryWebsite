var express = require("express");
var multer = require("multer");
var crypto = require("crypto");
var path = require("path");

var ensureAuthenticated = require("../../auth/auth").ensureAuthenticated;

var Post = require("../../models/post");

var router = express.Router();
var storage = multer.diskStorage({
    destination: './views/images/', 
    filename : function(req, file, cb){
        crypto.pseudoRandomBytes(16, function(err, raw){
            cb(null, raw.toString('hex') + Date.now() + path.extname(file.originalname));
        });
    }
});

// pass storage object as parameter
var upload = multer({storage: storage});

// add the entire ensureAuthenticator into router as middleware; all routes in this file will be authenticated
router.use(ensureAuthenticated);

// add middleware function ensureAuthenticated between "/posts" and "function
router.get("/", function (req, res) {  // go to the root of the route 
    // get all the posts under the user id
    Post.find({ userID: req.user._id }).exec(function (err, posts) {
        if (err) { console.log(err); }
        // pass all posts under variable posts so we can use in view posts.ejs
        res.render("post/posts", { posts: posts });
    });
});

// get all post related to user._id
router.get("/add", function (req, res) {
    res.render("post/addposts");
});

// add the new post
router.post("/add", function (req, res, next) {
    var newPost = new Post({
        title: req.body.title,  // retrieve data from user input
        content: req.body.content,
        userID: req.user._id    //include userid of signed in user
    });

    newPost.save(function (err, post) {  // save the post to the database
        if (err) { console.log(err); }
        res.redirect("/posts");
    });
});

// /: means a route parameter it could be anything and it's often an ID
// localhost:1337/post/12345 --. fetch the  post with id 12345
router.get("/:postId", function (req, res) {
    Post.findById(req.params.postId).exec(function (err, post) {  // params.postId need to be exact the same as /:postId
        if (err) { console.log(err); }
        res.render("post/detailpost", { post: post }); // pass the post associated with the postId to the view
    });
});

router.get("/edit/:postId", function (req, res) {
    Post.findById(req.params.postId).exec(function (err, post) {
        if (err) { console.log(err); }
        res.render("post/editpost", { post: post });
    });
});


// check what is different from above code and this
router.post("/update", upload.single('image'), async function (req, res) { // image is the name defined in ejs; upload.single() is a middleware function
    const post = await Post.findById(req.body.postid);

    post.title = req.body.title;
    post.content = req.body.content;
    post.image = req.file.path;

    // post.save()

    try {
        let savePost = await post.save();
        console.log("savepost", savePost);
        res.redirect("/posts/" + req.body.postid);
        //res.render("post/detailpost", { post: savePost });

    } catch (err) {
        console.log("error happened");
        res.status(500).send(err);
    }

});

router.get("/profile", function (req, res) {
    res.render("user/profile")
});

module.exports = router;

