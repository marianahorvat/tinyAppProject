var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

app.set("view engine", "ejs");   //Asking the app to use EJS as its templating engine

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");   //This should be declared before all of the routes
app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls/new", (req, res) => {                     //http://localhost:8080/urls/new
  res.render("urls_new");                               //GET Route to Show the Form to the User
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
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  var shortUrlName = req.params.shortURL;
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[shortUrlName]};   /* What goes here? */ 
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

function generateRandomString() {
  let randomCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  let randomNumber = "";
  for (var i = 0; i < 6; i++) {
    randomNumber += randomCharacters.charAt(Math.floor(Math.random()*randomCharacters.length));
  }
  return randomNumber;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

