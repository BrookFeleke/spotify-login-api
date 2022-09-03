require("dotenv").config();
const express = require("express");
const app = express();
const querystring = require("querystring");
const axios = require("axios");
const { generateRandomString } = require("./utils");
const port = 8888;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const stateKey = "spotify_auth_state";
const scope = "user-read-private user-read-email";
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
        res.json(response.data);
      } else {
        res.send(response);
      }
    })
    .catch((error) => {
      res.send(error);
    });
});

//Refresh token route
app.get("/refresh_token", (req, res) => {
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
      res.send(response.data);
    })
    .catch((error) => {
      res.send(error);
    });
});

app.listen(process.env.PORT || port);
