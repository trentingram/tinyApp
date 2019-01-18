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

/////// Databases
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
///////////// some helper functions
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

function readExistingEmails(str) {
  let flag = false;
  let userPassword;
  let userId;
  for (user in users) {
    if(str === users[user].email) {
      flag = true;
      userPassword = users[user].password;
      userId = users[user].id
    }
  }
  return {flag, userId, userPassword}
}

/////////// middle-ware handlers
app.route("/login")
.get((req, 
      res,
     ) => {
      let user_id = req.cookies.user_id
      let user = users[user_id]
      let templateVars = { 
        user: user
      };
    res.render("urls_login", templateVars);
  })
  .post((req, 
         res,
        ) => {
          let userEmail = req.body.email;
          let inputPassword = req.body.password;
          const {flag, userId, userPassword} = readExistingEmails(userEmail);
          if(flag === false) {
            let err = 'User cannot be found.'
            res.status(400)
            res.send(err)
          } else {
            if(flag === true && (inputPassword !== userPassword)) {
              let err = 'Password does not match.'
              res.status(403)
              res.send(err)     
           } 
          }
          
          res.cookie('user_id', userId)
          res.redirect("/urls")
        }     
)

app.route("/register")
.get((req, 
      res,
    ) => {
    let user_id = req.cookies.user_id
    let user = users[user_id]
    let templateVars = { 
      user: user
    };
    res.render("urls_register", templateVars);
  })
.post((req, 
       res,
     ) => {
      let newId = generateRandomString();
      let newEmail = req.body.email;
      let newPassword = req.body.password;
      const {flag} = readExistingEmails(newEmail);
      // check if email or password are undefined
      if(newEmail == '' || newPassword == '') {
        let err = 'Email or password are invalid.'
        res.status(400);
        res.send(err)
      } else {
        if(flag) {
          let err = 'Email already exists.'
          res.status(400)
          res.send(err) 
        }
      }
        // check if email already exists
 
          users[newId] = {
            id: newId,
            email: newEmail,
            password: newPassword
          }; 
          // set user id cookie
          res.cookie('user_id', newId)
          res.redirect("/urls");

        } 
      // add new user w/ id, email, and password to user database
)

app.get(
  "/urls", 
  (
    req, 
    res,
  ) => {
    
    let user_id = req.cookies.user_id
    let user = users[user_id]
    let templateVars = { 
      user,
      urls: urlDatabase,
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
    let user_id = req.cookies.user_id
    let user = users[user_id]

    let templateVars = { 
      user,
      shortURL: paramId,
      longURL: urlDatabase[paramId]
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
    delete urlDatabase[keyId]
    res.redirect("/urls");
  }
);

app.post(
  "/logout", 
  (
    req, 
    res,
  ) => {
    res.clearCookie('user_id');
    res.redirect("/login");
  }
);


app.listen(
  PORT, 
  () => {
  console.log(`Running on ${PORT}!`);
  }
);