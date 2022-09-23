require("dotenv").config();
const express = require("express");
const app = express();
var cors = require('cors')
const querystring = require("querystring");
const axios = require("axios");
const { generateRandomString } = require("./utils");
const port = 8888;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
app.use(cors({
  origin:"*"
}))
const corsy = (req, res, next) => {
  console.log("It is in the middleware");
  res.setHeader("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  next();
};

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", `${process.env.MY_DOMAIN}`); // update to match the domain you will make the request from
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });
const stateKey = "spotify_auth_state";
const scope =
  "user-read-private user-read-email user-read-recently-played user-read-playback-position user-top-read user-library-modify user-library-read playlist-read-collaborative playlist-modify-public playlist-read-private user-follow-read user-follow-modify";
app.get("/login", (req, res) => {
  const state = generateRandomString(16);
  console.log({ state });
  res.cookie(stateKey, state);

  const queryParams = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    state: state,
    scope: scope,
  });
  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

// default route
app.get("/", (req, res) => {
  res.send("This is a working api");
});

//main callback
app.get("/callback", (req, res) => {
  const code = req.query.code || null;

  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: REDIRECT_URI,
    }),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${new Buffer.from(
        `${CLIENT_ID}:${CLIENT_SECRET}`
      ).toString("base64")}`,
    },
  })
    .then((response) => {
      if (response.status === 200) {
        const { access_token, refresh_token, expires_in } = response.data;
        const queryParams = querystring.stringify({
          access_token,
          refresh_token,
          expires_in,
        });
        res.redirect(`${process.env.APP_URI}/?${queryParams}`);
      } else {
        res.redirect(
          `/?${querystring.stringify({ error: "Invalid access token" })}`
        );
      }
    })
    .catch((error) => {
      res.send(error);
    });
});


//Refresh token route
app.get("/refresh_token",corsy, (req, res) => {
  const { refresh_token } = req.query;
  console.log("It got into this shit ");
  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    }),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${new Buffer.from(
        `${CLIENT_ID}:${CLIENT_SECRET}`
      ).toString("base64")}`,
    },
  })
    .then((response) => {
      console.log(response.data);
      res.send(response.data);
    })
    .catch((error) => {
      res.send(error);
    });
});

app.listen(process.env.PORT || port);
