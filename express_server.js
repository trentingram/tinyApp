var express = require("express");
const bodyParser = require("body-parser");
var app = express();
var PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function generateRandomString() {
  const letters = ["a", "b", "c", "e", "f", "g"];
  let str = ""
  let count = 0;
  letters.forEach((each, i) => {
      str += letters[Math.floor(Math.random() * 6)]
      str += Math.floor(Math.random() * 6)
  })
  return str;
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });
  
app.get("/urls/:id", (req, res) => {
    var paramId = req.params.id;
    let templateVars = { shortURL: paramId,longURL: urlDatabase[paramId] };
    res.render("urls_show", templateVars);
  });

app.get("/u/:shortURL", (req, res) => {
    let sURL = req.params.shortURL
    let longURL = urlDatabase[sURL]
    console.log(urlDatabase, sURL)
    res.redirect(longURL);
  });

app.post("/urls", (req, res) => {
    let shortKey = generateRandomString();
    let addLongURL = req.body.longURL;
    urlDatabase[shortKey] = addLongURL
    res.send("Ok");         // Respond with 'Ok' (we will replace this)
  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});