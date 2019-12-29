# get-me-a-googleapi-refresh-token

The purpose of this package is to encapsulate authentication to Google APIs with OAuth2.

In particular we want to provision/verify refresh tokens *locally for a developer*, to test interacting with such a service.

*This is meant to get local credententials, for local development (i.e. the OAuth callback is on <http://127.0.0.1>).*

This library depends on the Google maintained [google-auth-library](https://github.com/googleapis/google-auth-library-nodejs#oauth2) package

The basics of Google's OAuth2 implementation is explained on [Google Authorization and Authentication documentation](https://developers.google.com/identity/protocols/OpenIDConnect).

## Publish

```bash
npm publish --access public
```

## TODO

- Rename public methods
- Test
- Publish, use in gphotos-googleapis
- Specific validators or url
- Implement refreshTokensDB.json (-db)
  - persist refresh token by account/id
- renovate

## Scopes

To identify a requested token with an `sub/id` field, we need to add `https://www.googleapis.com/auth/userinfo.profile` to our requested scopes. This is equivalent to the `profile` scope, and also provides us with a `name,given_name,family_name,picture` fields. You can also use `openid` as a requested scope, which will give ths `sub,picture` identification fields, but no name.

## Usage

- setup
- generate
- validate

## Parts

Some parts are harder to automate, so this description is still necessary

### Preparing - Creating Project and credentials

Before your application can use Google's OAuth 2.0 authentication system for user login, you must set up a project in the [Google API Console](https://console.developers.google.com/) to obtain OAuth 2.0 credentials and set an authentication callback (redirectUri).

- Goto [Google API Console](https://console.developers.google.com/)
- Create (or select an existing) Project
- Enable the API's you want to use in the [APIs & Services Section/Library](https://console.developers.google.com/apis/library)
- Go to [APIs and Services / Credentials tab](https://console.developers.google.com/apis/credentials).
- Create credentials > OAuth client ID
- Set the authorized JavaScript origin to <http://127.0.0.1> and the authorized redirect URL to <http://127.0.0.1:8080/auth/google/callback>. (The callback path can be any path you choose you choose)
- You can then copy the three pieces of information we need (or download the json credentials from the console)
  - Client ID
  - Client Secret
  - Redirect URI's

## References

- <https://github.com/googleapis/google-auth-library-nodejs#oauth2>
- <https://github.com/googlesamples/google-photos/tree/master/REST/PhotoFrame>
