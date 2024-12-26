const express = require('express');
const Post = require("./models/postModel");
const Account = require("./models/accountModel");
const mongoose = require("mongoose");
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

// Express.js session (For Login)
const session = require("express-session");

const app = express();
const port = process.env.PORT || 3000;

// Login cookie setup 
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: "00000",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // This Cookie will expires in 24 hours
  }
}));

// Send HTML file at root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pitterest-landingpage.html'));
});

app.get('/video', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'video.html'));
});

// Endpoint of Login-Page
app.get("/login-page", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login-page.html"));
});

// Serve static files from the "public" directory
app.use(express.static('public'));

// Middleware
app.use(express.json()); // for parsing application/json

//#region Connect to MongoDB
// MongoDB connection string
const mongoUrl = process.env.MONGODB_URI;

async function connectToDatabase() {
    try {
        const connect = await mongoose.connect(mongoUrl);
        console.log('Connected to MongoDB: ', connect.connection.host, connect.connection.name);
    } catch (err) {
        console.error('Could not connect to MongoDB', err);
        process.exit(1);
    }
}
connectToDatabase();
//#endregion Connect to MongoDB

const dbName = "INFSCI2560";
const collectionName = "INFSCI2560";
const AccountcollectionName = "Account";
const postCollectionName = "Post";

const atlasAPIEndpoint = 'https://us-east-2.aws.data.mongodb-api.com/app/data-atbre/endpoint/data/v1';
const atlasAPIKey = process.env.ATLAS_API_KEY;
const clusterName = 'INFSCI2560';

// -------- Login Logic -----------
app.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  const headers = {
    "Content-Type": "application/json",
    "api-key": atlasAPIKey,
  };

  const body = {
    dataSource: clusterName,
    database: dbName,
    collection: AccountcollectionName,
    filter: {
      username: username,
    }, // Modify if you want to filter the results
  };
  try {
    const endPointFunction = "/action/findOne";
    //call API
    const apiResponse = await fetch(atlasAPIEndpoint + endPointFunction, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });
    const data = await apiResponse.json();
    //console.log(data);

    if (!data || password != data.document.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    
    // User authenticated, set user ID in session
    req.session.user = data.document._id;
    req.session.name = data.document.name;
    req.session.save(function (err) {
      if (err) return next(err)
    })
    res.send(req.session);
    //console.log(req.session);
  } catch (error) {
    console.error("Error fetching data from Atlas API:", error);
    res.status(500).send("Error fetching dataaa");
  }
});

// If logged in successful, then show dashboard. If hasn't logged in, then redirect to login-page
app.get('/pitterest-dashboard', function(req, res, next) {
  //console.log(req.session.user);
  //console.log("In Signup Page");
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "public", "pitterest-dashboard.html"));
  } else {
    res.sendFile(path.join(__dirname, "public", "login-page.html"));
  }
})

app.get("/get-session", async(req, res, next)=>{
  //console.log("GET SESSION ");
  //console.log(req.session);
  if(req.session.user){
    res.send(req.session);
    //console.log(req.session);
  }else{
    res.send(req.session);
  }
  
})

// login-out
app.post('/logout', (req, res) => {
  req.session.destroy();
  return res.status(200).json({ message: "LOGOUT" });
  
});
// -------- Login Logic Ends Here --------
//
// Endpoint for sign up page
app.get('/sign-up-page', function(req, res, next) {
  //console.log(req.session.user);
  //console.log("In Signup Page");
  res.sendFile(path.join(__dirname, "public", "sign-up-page.html"));
  
})

app.get('/retrieve-data/:function', async (req, res) => {
    //console.log("(retrieve-data)req.session.user: ", req.session.user);
    const page = req.params.function;
    let filter = {};
    let useID = "";
    //fetch all/personal post
    if(page == "dash"){
      if (req.session.user == "662335de0f91901ae3d334f2") { //admin
        filter = {};
      } else {
        filter = { userid: req.session.user };
      }
    };

    try {
        const data = await Post.find(filter);
        //console.log("Page: ", page, ", data:", data);
        res.send(data); // Send the data to the client
    } catch (error) {
        console.error('Error fetching data from Atlas API:', error);
        res.status(500).send('Error fetching data');
    }
});

app.post('/post-create', async (req, res) => {
    // Data sent from the frontend to be added
    const newPostData = req.body;

    try {
        //add via dbconnection
        const newPost = new Post(newPostData);
        await newPost.save();
        res.status(201).json(newPostData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/create-account', async (req, res) => {
    // Data sent from the frontend to be added
    const newPostData = req.body;

    try {
        //add via dbconnection
        const newPost = new Account(newPostData);
        await newPost.save();
        res.status(201).json(newPostData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/get-post-data/:postid', async (req, res) => {
    const postId = req.params.postid;
    //console.log("PostID: ", postId);
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send({ message: "No post found" });
        }
        //console.log("Post data: ", post);
        res.send(post); // Send the data to the client
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).send('Error fetching data');
    }
});

//TODO udate post data
app.put('/update-data/:id', async (req, res) => {
    try {
        // Get the post ID from the URL parameters
        const postId = req.params.id;
        
        // Extract data from the request body
        const { title, description, location, link, category, userid } = req.body;
        
        // Find and update the post in the database
        // Assuming you have a `Post` model representing post data
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            {
                title,
                description,
                location,
                link,
                category,
                userid
            },
            { new: true } // Return the updated post
        );
        
        if (!updatedPost) {
            // If the post is not found, return a 404 status code
            return res.status(404).json({ error: 'Post not found' });
        }
        
        // Successfully updated the post, return a 200 status code and the updated post data
        res.status(200).json(updatedPost);
    } catch (error) {
        // Handle errors and return a 500 status code
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'An error occurred while updating the post' });
    }
});


app.delete('/delete-post/:postid', async (req, res) => {
    const postidValue = req.params.postid;
    console.log("postid: ", postidValue);
    try {
        const result = await Post.deleteOne({ _id: postidValue });

        if (result.deletedCount === 0) {
            // If no documents were deleted, send a 404 response
            res.status(404).json({ message: 'No post found with the given ID' });
        } else {
            // If the post was successfully deleted, send a 200 response
            res.status(200).json({ message: 'Post successfully deleted', result });
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send({ message: 'Error deleting post', error: error.toString() });
    }
});

// Listen to port...
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});