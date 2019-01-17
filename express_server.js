const express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
// var morgan = require('morgan')
const app = express();
const PORT = 8080;
////////
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser())
// app.use(morgan('combined'))
///////
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

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}


app.route("/register")
.get((req, 
      res,
    ) => {
    let templateVars = { 
      username: req.cookies["username"]
    };
    res.render("urls_new", templateVars);
  })
.post((req, 
       res,
       next,
     ) => {
      let newId = generateRandomString()
      let newEmail = req.body.email;
      let newPassword = req.body.password;
      if(newEmail === 'xyz@xyz.com') {
        let err = new Error(`Invalid email`)
        err.statusCode = 400;
        next(err) 
      }

      users[newId] = {
        id: newId,
        email: newEmail,
        password: newPassword
      }; 
      res.cookie('user_id', newId)
      // set cookie and redirect
      console.log(users)
     res.redirect("/urls");
  })



app.get(
  "/urls", 
  (
    req, 
    res,
  ) => {
    let templateVars = { 
      urls: urlDatabase,
      username: req.cookies["username"]
    };
    res.render("urls_index", templateVars);
  }
);

app.get(
  "/urls/:id", 
  (
    req, 
    res,
  ) => {
    let paramId = req.params.id;

    let templateVars = { 
      shortURL: paramId,
      longURL: urlDatabase[paramId],
      username: req.cookies["username"]
    };

    res.render("urls_show", templateVars);
  }
);

app.get(
  "/urls/:id/edit", 
  (
    req, 
    res,
  ) => {
    let idKey = req.params.id;
    res.redirect(`urls/${idKey}`);
  }
);
  

app.post(
  "/login", 
  (
    req, 
    res,
  ) => {
  let usernameCookie = req.body.username 
  res.cookie('username', usernameCookie)
  console.log(req.headers)
  res.redirect("/urls");
  }
);

app.post(
  "/urls/:id/update", 
  (
    req, 
    res,
  ) => {
    let idKey = req.params.id
    let newURL = req.body.newURL
    urlDatabase[idKey] = newURL;
    res.redirect("/urls");
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

app.post(
  "/logout", 
  (
    req, 
    res,
  ) => {
    res.clearCookie('username');
    res.redirect("/urls");
  }
);

/////////
// default error message handling
app.use((err, 
         req, 
         res, 
         next,)  => {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.send(`${err.statusCode}: ${err.message}`);
});

app.listen(
  PORT, 
  () => {
  console.log(`Example app listening on port ${PORT}!`);
  }
);
