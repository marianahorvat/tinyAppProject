var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();

var PORT = 8080; // default port 8080

app.set("view engine", "ejs");   //Asking the app to use EJS as its templating engine
app.use(cookieParser());         //Asking the app to use cookieParser parameter 

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const bodyParser = require("body-parser");   //This should be declared before all of the routes
app.use(bodyParser.urlencoded({extended: true}));

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "abc"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

function findUserByEmail(email, users) {
  for (var user_ID in users) {
    console.log(user_ID)
    if (email === users[user_ID]["email"]) {
      console.log(users[user_ID])
      return users[user_ID];    // if email is in the database return true
    }
  }
  return false;
};

app.get("/urls/new", (req, res) => {                //GET Route to Show the Form to the User
  let userId = req.cookies['user_ID'];
  let userEmail = req.cookies['user_email'];
  let currentUserObject = users[userId];
  if (userId) {                                             //Only Registered Users Can Shorten URLs
    let templateVars = {user: currentUserObject, urls: urlDatabase, 'user.email': userEmail }                    //    http://localhost:8080/urls/new
    res.render("urls_new", templateVars); 
  } else {
    res.redirect("/login");
  }
});        //s/b before app.get("/urls/:id", ...) any calls to /urls/new will be handled by app.get("/urls/:id", ...) 

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {                         //http://localhost:8080/urls
  console.log("Req.cookies is: ",req.cookies)
  let userId = req.cookies['user_ID'];
  console.log("userID is: ",userId);
  let currentUserObject = users[userId];
  let email;
  if (currentUserObject) {
    email = currentUserObject.email;
  }
  console.log("Current User Object is: ",currentUserObject);
  let templateVars = {user: currentUserObject, urls: urlDatabase, 'user.email': email };
  console.log("Users Database is: ",users)
  
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {                         //http://localhost:8080/urls
  //let templateVars = {email: req.cookies["email"], urls: urlDatabase };
  //console.log("Users Database is: ",users)
  
  res.render("urls_login");
});

app.post("/login", (req,res) => {                      //http://localhost:8080/urls/login
  const email = req.body.email;
  const password = req.body.password;
  console.log(password)
  const currentUserObject = findUserByEmail(email, users)

    if (currentUserObject === false) {       // if user is not in the database
      res.statusCode = 400;
      res.end("Unknown");
    } else if (password !== currentUserObject.password) {
        res.statusCode = 400;
        res.end("Unknown tttt");
      } else {
        res.cookie("user_ID", currentUserObject.id);
        res.cookie("user_email", currentUserObject.email);
        res.redirect("/urls");
    } 
});

app.get("/urls/:shortURL", (req, res) => {  //   http://localhost:8080/urls/b2xVn2
  var shortUrlName = req.params.shortURL;
  let userId = req.cookies['user_ID'];
  let userEmail = req.cookies['user_email'];
  let currentUserObject = users[userId];
  let templateVars = {
    user: currentUserObject,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[shortUrlName].longURL,
    urls: urlDatabase, 'user.email': userEmail };   /* What goes here? */ 
  res.render("urls_show", templateVars);     //updated above longURL value (added ".longURL") to the new database structure to be passed to templates through templateVars
});

app.get("/u/:shortURL", (req, res) => {  //shorter version for our redirect links: //http://localhost:8080/u/shortURL
  var shortUrlName = req.params.shortURL;   //   http://localhost:8080/u/b2xVn2
  const longURL = urlDatabase[shortUrlName].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {  //   http://localhost:8080/register
  res.render("urls_register"); //returns the register template
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    res.statusCode = 400;
    res.end("Unknown");
  } else if (findUserByEmail(email, users) === false) {
    let user_ID = generateRandomString();
    users[user_ID] = {id: user_ID,
                      email: email,
                      password: password}

    cookieParser.JSONCookie(user_ID)
        res.cookie("user_email", currentUserObject.email);
    res.cookie("user_ID", user_ID);
    res.cookie("user_email", currentUserObject.email);
    res.redirect("/urls");
  } else {
    res.statusCode = 400;
    res.end("Unknown");
  }
});

app.post("/urls", (req, res) => {
  let randShortURL = generateRandomString();
  console.log("urlDatabase before is: ",urlDatabase);
  urlDatabase[randShortURL] = {     //Add a new userID (string) property to individual url objects within the urlDatabase collection.
    longURL: req.body.longURL,
    user_ID: req.cookies["user_ID"]  
  };
  console.log("urlDatabase after is: ",urlDatabase);
  res.redirect(`/urls/${randShortURL}`);
});

app.post("/logout", (req,res) => {                     //Logout
  res.clearCookie("user_ID");
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {      //   Delete shortURL http://localhost:8080/urls/
  var shortUrlName = req.params.shortURL;
  delete urlDatabase[shortUrlName];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/update", (req,res) => {
  delete urlDatabase[req.params.shortURL];
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

app.get("/urls/:id" , (req, res) => {      // display the form from urls_show
  res.render("urls_show", {shortURL: req.params.id});
 });
 
 app.post("/urls/:id", (req, res) => {     //update URL
  let change = req.body.longURL;
  urlDatabase[req.params.id] = change;
  res.redirect("/urls");
 });

function generateRandomString() {
  let randomCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  let randomNumber = "";
  for (var i = 0; i < 5; i++) {
    randomNumber += randomCharacters.charAt(Math.floor(Math.random()*randomCharacters.length));
  }
  return randomNumber;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

