
//---------------------------------------------------------------
//TINYAPP: A CONVERSION ENGINE FROM SHORTURL TO LONGURL 
//---------------------------------------------------------------


//---------------------------------------------------------------
//DECLARING VARIABLES
//---------------------------------------------------------------
var express = require("express");
var cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");   //This should be declared before all of the routes
var cookieSession = require("cookie-session");
var PORT = 8080; // default port 8080
var app = express();
//---------------------------------------------------------------

//---------------------------------------------------------------
//DATABASES
//---------------------------------------------------------------
const urlDatabase = {};
const users = {}
//---------------------------------------------------------------

//---------------------------------------------------------------
//INITIALIZATION
//---------------------------------------------------------------
app.set("view engine", "ejs");   //Asking the app to use EJS as its templating engine
app.use(cookieParser());         //Asking the app to use cookieParser parameter 
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["key_1"],
  maxAge: 24 * 60 * 60 * 1000 // Cookie Options 24 hours
}))
//---------------------------------------------------------------

//---------------------------------------------------------------
//RETURN LONGURLs GIVEN USERID
//---------------------------------------------------------------
function urlsForUser(id){
  let URLsUser = {};
  for(let shortURL in urlDatabase){
    
    if(urlDatabase[shortURL].userID === id){
      URLsUser[shortURL] = urlDatabase[shortURL];
    }
  }
  return URLsUser;
}
//---------------------------------------------------------------

function findUserByEmail(email, users) {
  for (var user_ID in users) {
    if (email === users[user_ID]["email"]) {
      return users[user_ID];    // if email is in the database return true
    }
  }
  return false;
};

function generateRandomString() {
  let randomCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  let randomNumber = "";
  for (var i = 0; i < 5; i++) {
    randomNumber += randomCharacters.charAt(Math.floor(Math.random()*randomCharacters.length));
  }
  return randomNumber;
}

//---------------------------------------------------------------
//MAIN PAGE   http://localhost:8080/urls
//---------------------------------------------------------------
app.get("/urls", (req, res) => {
  let userId = req.session["user_ID"];
  let currentUserObject = users[userId];
  let email;
  if (currentUserObject) {
    email = currentUserObject.email;
  }
  if (userId) {
  let templateVars = {
    user: currentUserObject, 
    urls: urlsForUser(userId), 
    "user.email": email
    };  
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  let randShortURL = generateRandomString();
  urlDatabase[randShortURL] = {     
    longURL: req.body.longURL,
    userID: req.session["user_ID"]  
  };
  res.redirect("/urls");
}); //Add a new user_ID (string) property to individual url objects within the urlDatabase collection.
//---------------------------------------------------------------

//---------------------------------------------------------------
//CREATE NEW URL PAGE  http://localhost:8080/urls/new
//GET Route to Show the Form to the User
//---------------------------------------------------------------
app.get("/urls/new", (req, res) => {   
  let userId = req.session["user_ID"];
  let userEmail = req.session["user_email"];
  let currentUserObject = users[userId];
  if (userId) {                       //Only Registered Users Can Shorten URLs
    let templateVars = {user: currentUserObject, urls: urlDatabase, "user.email": userEmail }
    res.render("urls_new", templateVars); 
  } else {
    res.redirect("/login");
  }
}); //Comment no longer needed: s/b before app.get("/urls/:id", ...) any calls to /urls/new will be handled by app.get("/urls/:id", ...) 
//---------------------------------------------------------------


//---------------------------------------------------------------
//SHORTURL PAGE   http://localhost:8080/urls/:shortURL
//                http://localhost:8080/urls/b2xVn2
//---------------------------------------------------------------
app.get("/urls/:shortURL", (req, res) => {
  var shortUrlName = req.params.shortURL;
  let userId = req.session["user_ID"];
  let userEmail = req.session["user_email"];
  let currentUserObject = users[userId];
  if (!userId) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: currentUserObject,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[shortUrlName].longURL,
      urls: urlDatabase, "user.email": userEmail };
    res.render("urls_show", templateVars); 
  }    
});
//---------------------------------------------------------------

//---------------------------------------------------------------
//REGISTRATION PAGE   from registration.ejs
//---------------------------------------------------------------
app.get("/register", (req, res) => {  //   http://localhost:8080/register
  if (req.session["user_ID"] === undefined) {
    res.render("urls_register", {user_id: undefined});
} else {
  res.redirect("/urls"); //returns the register template 
}
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password,10);
  //console.log(hashedPassword);
  if (!email || !password) {
    res.statusCode = 400;
    res.end("Please enter the email and password.");
  } else if (findUserByEmail(email, users) === false) {
    let user_ID = generateRandomString();
    users[user_ID] = {id: user_ID,
                      email: email,
                      password: hashedPassword}
    cookieParser.JSONCookie(user_ID)
    req.session["user_ID"] = user_ID;
    res.redirect("/urls");
  } else {
    res.statusCode = 400;
    res.end("Your email is already registered");
  }
});
//---------------------------------------------------------------

//---------------------------------------------------------------
//LOGIN PAGE
//---------------------------------------------------------------
app.get("/login", (req, res) => {             //http://localhost:8080/urls
  let templateVars = {};
    if (req.session["user_ID"] === undefined) {
        templateVars = {
          user_id: req.session["user_ID"], 
        }; 
        res.render("urls_login", templateVars);
    } else {
      res.render("/urls");   //"urls_login"
    }
});

app.post("/login", (req,res) => {            //http://localhost:8080/urls/login
  let email = req.body.email;
  let password = req.body.password;
  let currentUserObject = findUserByEmail(email, users);
  let userId = currentUserObject["id"];
    if (currentUserObject === false) {       // if user is not in the database
      res.statusCode = 400;
      res.end("Incorrect email and/or password");
    } else if (!bcrypt.compareSync(password, currentUserObject.password)) {
        res.statusCode = 400;
        res.end("Incorrect password");
      } else {
        req.session["user_ID"] = userId; 
        res.redirect("/urls");
    } 
});

//---------------------------------------------------------------
//LOGOUT PAGE
//---------------------------------------------------------------
app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect("/urls");
});
//---------------------------------------------------------------


//---------------------------------------------------------------
//DELETE SHORT URL      http://localhost:8080/urls    urls_index.ejs
//---------------------------------------------------------------
app.post("/urls/:shortURL/delete", (req, res) => { // Delete shortURL http://localhost:8080/urls/
  var shortUrlName = req.params.shortURL;
  if(req.session["user_ID"]) {
    delete urlDatabase[shortUrlName];
    res.redirect(`/urls`);
  } else {
    res.redirect("/login");
  }
});
//---------------------------------------------------------------

//---------------------------------------------------------------
//EDIT LONGURL
//from urls_show.ejs (http://localhost:8080/urls)
//---------------------------------------------------------------
app.post("/urls/:shortURL/update", (req,res) => {
  if (req.session["user_ID"]) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect(`/urls`);
  } else {
    res.redirect("/login");
  }
});
//---------------------------------------------------------------

//---------------------------------------------------------------
//DISPLAY urlDatabase                 http://localhost:8080/u/shortURL
//                                    http://localhost:8080/u/b2xVn2
//Shorter version for our redirect. The /u/ differentiates from /url/ so it doesn't conflict with the other GET routes
//---------------------------------------------------------------
app.get("/u/:shortURL", (req, res) => {  // 
  var shortUrlName = req.params.shortURL;   //   
  const longURL = urlDatabase[shortUrlName].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.send(`${req.params.shortURL} is not a valid short URL`);
  }
});

app.get("/urls.json", (req, res) => {  
  res.json(urlDatabase);
});
//---------------------------------------------------------------

//---------------------------------------------------------------
//ROOT PATH
//---------------------------------------------------------------
app.get("/", (req, res) => {
  res.redirect("/urls");
});
//---------------------------------------------------------------

//---------------------------------------------------------------
//HELLO WORLD PATH
//---------------------------------------------------------------
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//---------------------------------------------------------------

//---------------------------------------------------------------
//LISTENER
//---------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//---------------------------------------------------------------







