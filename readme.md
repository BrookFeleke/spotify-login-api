## API to Login to spotify

A simple api that abstracts Authorizing to spot

### Routes
`GET` /login
`GET` /callBack
`GET` /refresh_token

### Response Schema

```JSON
{
  "access_token": "...",
  "token_type": "...",
  "expires_in": 3600,
  "scope": "..."
}
```
