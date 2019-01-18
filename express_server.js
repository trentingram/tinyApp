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
  for (user in users) {
    if(str === users[user].email) {
      flag = true;
      userPassword = users[user].password;
    }
  }
  return {flag, userPassword}
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
         next,
        ) => {
          let userEmail = req.body.email;
          let inputPassword = req.body.password;
          const {flag, userPassword} = readExistingEmails(userEmail);
          console.log(users)
          if(flag === false) {
            let err = new Error('User cannot be found.')
            err.statusCode = 403;
            next(err) 
          } else {
          if(flag === true && (inputPassword !== userPassword)) {
              let err = new Error('Password does not match.')
              err.statusCode = 403;
              next(err)          
          } else {
            res.redirect("/")
          } 
        }      
})

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
       next,
     ) => {
      let newId = generateRandomString();
      let newEmail = req.body.email;
      let newPassword = req.body.password;
      let emailExists = readExistingEmails(newEmail);
      // *** bug: sync code is responding before error is fired
      // check if email or password are undefined
      if(newEmail == '' || newPassword == '') {
        let err = new Error('Email or password are invalid.')
        err.statusCode = 400;
        next(err) 
      } else {
        // check if email already exists
        if(emailExists) {
          let err = new Error('Email already exists.')
          err.statusCode = 400;
          next(err) 
        }
      } 
        users[newId] = {
          id: newId,
          email: newEmail,
          password: newPassword
        }; 
        // set user id cookie
        res.cookie('user_id', newId)
        res.redirect("/urls");
      // add new user w/ id, email, and password to user database
  })

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

/////////
// default error handler
app.use((err, 
         req, 
         res, 
         next,)  => {
  console.error(err.message);
  !err.statusCode ? err.statusCode = 500 : null;
  err.message === 'Invalid email.' ? res.send(`${err.statusCode}: ${err.message}`): null;
  err.message === 'Email already exists.' ? res.send(`${err.statusCode}: ${err.message}`): null;
  err.message === 'User cannot be found.' ? res.send(`${err.statusCode}: ${err.message}`): null;
  err.message === 'Email does not match.' ? res.send(`${err.statusCode}: ${err.message}`): null;

});

app.listen(
  PORT, 
  () => {
  console.log(`Running on ${PORT}!`);
  }
);