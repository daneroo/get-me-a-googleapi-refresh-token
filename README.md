# get-me-a-googleapi-refresh-token

The purpose of this package is to encapsulate authentication to Google APIs with OAuth2.

In particular we want to provision/verify refresh tokens *locally for a developer*, to test interacting with such a service.

*This is meant to get local credententials, for local development (i.e. the OAuth callback is on <http://127.0.0.1>).*

This library depends on the Google maintained [google-auth-library](https://github.com/googleapis/google-auth-library-nodejs#oauth2) package

The basics of Google's OAuth2 implementation is explained on [Google Authorization and Authentication documentation](https://developers.google.com/identity/protocols/OpenIDConnect).

## TODO

- Document provisioning App Credentials
- Remove a level from `oauth2.keys.json`
- Implement refreshTokensDB.json
  - persist refresh token by account
- yargs: verify,renew,noauth,user
- extract Auth/TokenManagement into npm
- renovate
- `google-auth-library` is included in `googleapis`, switch to that

## Usage

- setup
- generate
- validate

## Parts

Some parts are harder to automate, so this description is still necessary

### Preparing - Creating Project and credentials

Before your application can use Google's OAuth 2.0 authentication system for user login, you must set up a project in the [Google API Console](https://console.developers.google.com/) to obtain OAuth 2.0 credentials and set an authentication callback (redirectURI).

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
