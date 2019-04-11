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

app.get("/urls/new", (req, res) => { 
  let templateVars = {username: req.cookies["username"]}                    //    http://localhost:8080/urls/new
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
  let templateVars = {username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {  //   http://localhost:8080/urls/b2xVn2
  var shortUrlName = req.params.shortURL;
  let templateVars = {username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[shortUrlName]};   /* What goes here? */ 
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {  //shorter version for our redirect links: //http://localhost:8080/u/shortURL
  var shortUrlName = req.params.shortURL;   //   http://localhost:8080/u/b2xVn2
  const longURL = urlDatabase[shortUrlName];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let randShortURL = generateRandomString();
  urlDatabase[randShortURL] = req.body.longURL;
  res.redirect(`/urls/${randShortURL}`);
});

app.post("/logout", (req,res) => {                     //Logout
  res.clearCookie("username");
  res.redirect("/urls");
});

app.post("/login", (req,res) => {                      //http://localhost:8080/urls/login
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {      //   Delete shortURL http://localhost:8080/urls/
  var shortUrlName = req.params.shortURL;
  delete urlDatabase[shortUrlName];
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

