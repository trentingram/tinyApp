const express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
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
  "b2xVn2": {
    userId: "user2RandomID",
    url: "http://www.lighthouselabs.ca"
  },
  "9sm5xK": {
    userId: "userRandomID",
    url: "http://www.google.com"
  } 
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "test@test.com", 
    password: "test"
  },
  "user3RandomID": {
    id: "user3RandomID", 
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
function findIdWithShort(str) {
  var uniqueId;
  var short;
  var long;
  for(each in urlDatabase) {
    if(urlDatabase[each].userId === str) {
      unique = urlDatabase[each].userId
      short = each;
      long = unique = urlDatabase[each].userId;
    }
  }
  return {unique, short, long}
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
          // check if email is on user object
          if(flag === false) {
            let err = 'User cannot be found.'
            res.status(400)
            res.send(err)
          } else if(flag === true && (inputPassword !== userPassword)) {
              let err = 'Password does not match.'
              res.status(403)
              res.send(err)     
           }  else {
            res.cookie('user_id', userId)
            res.redirect("/urls")
          }
          
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
      var hashedPassword = bcrypt.hashSync(newPassword, saltRounds);

      const {flag} = readExistingEmails(newEmail);
      // check if email or password are undefined
      if(newEmail == '' || newPassword == '') {
        let err = 'Email or password are invalid.'
        res.status(400);
        res.send(err)
      } else {
      // check if email already exists
        if(flag) {
          let err = 'Email already exists.'
          res.status(400)
          res.send(err) 
        }
      }
      // add new user w/ id, email, and password to user database
          users[newId] = {
            id: newId,
            email: newEmail,
            password: hashedPassword
          }; 

      // add new user to urlsDatabase
          urlDatabase[newId] = {
            id: newId,
            url: "iNeedAURL@url.com"
          }
          console.log(users)
          // set user id cookie
          res.cookie('user_id', newId)
          res.redirect("/urls");

        } 
) 

// app.route("/new")
// .get((req, 
//       res,
//     ) => {
//       let user_id = req.cookies.user_id
//       let user = users[user_id]
//       let templateVars = { 
//         user
//       };
//       res.redirect("/login")
//     } else {
//       res.render("urls_new", templateVars);
//     }
    
//   }
// );

app.route("/urls")
  .get((
    req, 
    res,
  ) => {
    
    let user_id = req.cookies.user_id;
    let user = users[user_id];
    let url = urlDatabase;
    let templateVars = { 
      user_id,
      user,
      url,
    }
    res.render("urls_index", templateVars);
  }
)
.post((
    req, 
    res,
  ) => {
    let user_id = req.cookies.user_id;
    let shortKey = generateRandomString();
    let addLongURL = req.body.longURL;
    urlDatabase[shortKey] = {
      userId: user_id,
      url: addLongURL
    }
    console.log(urlDatabase)
    res.redirect("/urls");
  }
 )

app.get("/urls/new", (req, res) => {
  let user_id = req.cookies.user_id
  let user = users[user_id]
  let templateVars = { 
    user,
    urls: urlDatabase
  };
  if(user === undefined) {
    res.redirect("/login")
  } else {
    res.render("urls_new", templateVars)
  }
  
  
});

app.get(
  "/urls/:id", 
  (
    req, 
    res,
  ) => {
    let user_id = req.cookies.user_id
    let {unique, short, long} = findIdWithShort(user_id)
    let user = users[user_id]
    let templateVars = { 
      user,
      short,
      long,
    };
    // check to make sure cookie id matches user_id
    if(user_id !== unique) {
      res.send("you cannot edit.");
    } else {
      res.render("urls_show", templateVars);
    }
    
  }
);

app.get("/u/:shortURL", (req, res) => {
  let short = req.params.shortURL;
  let longURL = urlDatabase[short].url
  console.log(urlDatabase, short, longURL)
  res.redirect(longURL);
});

app.get(
  "/urls/:id/edit", 
  (
    req, 
    res,
  ) => {
    let idKey = req.params.id;
    res.redirect(`/urls/${idKey}`);
  }
);

app.post(
  "/urls/:id/update", 
  (
    req, 
    res,
  ) => {
    let user_id = req.cookies.user_id
    let newURL = req.body.newURL;
    let {unique, short, long} = findIdWithShort(user_id)
    urlDatabase[short].url = newURL;
    console.log('new: ',req.body.newURL, )
    res.redirect("/urls");
  }
);

app.post(
  "/urls/:id/delete", 
  (
    req, 
    res,
  ) => {
    let user_id = req.cookies.user_id;
    let {unique, short} = findIdWithShort(user_id)
    let user = users[user_id];
    let url = urlDatabase;
    let templateVars = { 
      user_id,
      user,
      url,
    }    
    if(user_id !== unique) {
      res.send("you cannot delete.");
      } else {
      delete urlDatabase[short];
      res.render("urls_index", templateVars);
      }
    
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