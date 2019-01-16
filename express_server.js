const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function generateRandomString() {
  const letters = ["a", "b", "c", "e", "f", "g"];
  let str = ""
  for (var i in letters){
    i%2 === 0 ? 
      str += letters[Math.floor(Math.random() * 6)] :
    i%2 !== 0 ?
      str += Math.floor(Math.random() * 6) : null
  }
  return str;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get(
  "/urls", 
  (
    req, 
    res,
  ) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  }
);

app.get(
  "/urls/new", 
  (
    req, 
    res,
  ) => {
    res.render("urls_new");
  }
);
  
app.get(
  "/urls/:id", 
  (
    req, 
    res,
  ) => {
    let paramId = req.params.id;
    let templateVars = { shortURL: paramId,longURL: urlDatabase[paramId] };
    res.render("urls_show", templateVars);
  }
);

app.get(
  "/u/:shortURL", 
  (
    req, 
    res,
  ) => {
    let sURL = req.params.shortURL
    let longURL = urlDatabase[sURL]
    console.log(urlDatabase, sURL)
    res.redirect(longURL);
  }
);

app.get(
  "/urls/:id/edit", 
  (
    req, 
    res,
  ) => {

    res.send("Edit OK");
  }
);

app.post(
  "/urls", 
  (
    req, 
    res,
  ) => {
    let shortKey = generateRandomString();
    let addLongURL = req.body.longURL;
    urlDatabase[shortKey] = addLongURL
    console.log(urlDatabase)
    res.send("Ok");
  }
);

app.post(
  "/urls/:id/delete", 
  (
    req, 
    res,
  ) => {
    let keyId = req.params.id
    console.log(keyId)
    delete urlDatabase[keyId]
    console.log(urlDatabase)
    res.redirect("/urls");
  }
);



app.listen(
  PORT, 
  () => {
  console.log(`Example app listening on port ${PORT}!`);
  }
);