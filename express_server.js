var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();

var PORT = 8080; // default port 8080

app.set("view engine", "ejs");   //Asking the app to use EJS as its templating engine
app.use(cookieParser());         //Asking the app to use cookieParser parameter 

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

// newUser = function(username) {
//   //console.log(“function running”);
//   for (let newUser in user) {
//    console.log();
//    if (user[newUser].email === username) {
//     return user[newUser];
//      }
//    }
//   };

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

app.get("/urls/new", (req, res) => { 
  let templateVars = {email: req.cookies["email"], urls: urlDatabase}                    //    http://localhost:8080/urls/new
  res.render("urls_new", templateVars);                               //GET Route to Show the Form to the User
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
  let templateVars = {email: email, urls: urlDatabase };
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
        res.redirect("/urls");
    } 
});

app.get("/urls/:shortURL", (req, res) => {  //   http://localhost:8080/urls/b2xVn2
  var shortUrlName = req.params.shortURL;
  let templateVars = {email: req.cookies["email"], shortURL: req.params.shortURL, longURL: urlDatabase[shortUrlName], urls: urlDatabase };   /* What goes here? */ 
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {  //shorter version for our redirect links: //http://localhost:8080/u/shortURL
  var shortUrlName = req.params.shortURL;   //   http://localhost:8080/u/b2xVn2
  const longURL = urlDatabase[shortUrlName];
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
    res.cookie("user_ID", user_ID);
    res.redirect("/urls");
  } else {
    res.statusCode = 400;
    res.end("Unknown");
  }
});

app.post("/urls", (req, res) => {
  let randShortURL = generateRandomString();
  urlDatabase[randShortURL] = req.body.longURL;
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

