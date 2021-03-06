const { OAuth2Client } = require('google-auth-library')
const http = require('http')
const url = require('url')
const open = require('open')
const enableDestroy = require('server-destroy')

module.exports = {
  usingRefreshToken,
  validateScope,
  makeRefreshTokenWithWebFlow,
  // - end of public API
  getTokensFromAuthorizationCode,
  getAuthorizationCode
}

// might want to verfy requested scopes
// returns an authenticated OAuth2Client
async function usingRefreshToken ({
  clientId, clientSecret,
  refreshToken,
  scopes: desiredScopes, // renamed to avoid conflict with obtained scopes.
  verbose = false
}) {
  const oAuth2Client = new OAuth2Client({
    clientId,
    clientSecret,
    // To test eager refresh add: eagerRefreshThresholdMillis: 3600000 - 10000,
    forceRefreshOnFailure: true
  })

  // listener to show token events.
  if (verbose) {
    oAuth2Client.on('tokens', (t) => {
      // console.log('** usingRefreshToken ** tokens', t)
      const exp = new Date(t.expiry_date)
      const secondsFromNow = ((+exp - new Date()) / 1000).toFixed(1)
      console.debug(`** usingRefreshToken refreshed. Access expires in ${secondsFromNow}s (${exp})`)
    })
  }

  const { tokens } = await oAuth2Client.refreshToken(refreshToken)
  // The returned tokens object does not include the passed in refreshToken,
  // We add it back so that the client is able to refresh the access tokens on failure or eager refresh
  tokens.refresh_token = refreshToken
  if (verbose) {
    console.log('refreshed tokens', tokens)
  }
  oAuth2Client.setCredentials(tokens)

  const tokenInfo = await oAuth2Client.getTokenInfo(oAuth2Client.credentials.access_token)
  if (verbose) {
    console.log({ tokenInfo })
  }

  // Make sure we got all the scopes we wanted
  const scopesOk = await validateScope(tokenInfo.scopes, desiredScopes)
  if (!scopesOk) {
    // Let's not make this fatal, validateScope prints warnings
    // throw new Error('Missing authorization scopes')
  }

  return oAuth2Client
}

async function validateScope (actualScopes, desiredScopes) {
  // console.debug('Verifying requested scopes', { desiredScopes, actualScopes })
  let allOk = true
  for (const scope of desiredScopes) {
    const ok = actualScopes.indexOf(scope) >= 0
    if (!ok) {
      console.error(`Requested scope not found: (${scope})`)
      allOk = false
    }
  }

  // Warning for extraneous (unrequested) scopes
  for (const scope of actualScopes) {
    const notNeeded = desiredScopes.indexOf(scope) < 0
    if (notNeeded) {
      console.warn(`Warning scope is present but not needed: (${scope})`)
    }
  }

  return allOk
}

// This triggers a new web flow, opening op a browser window
// assumes the parameters were validated
// returns {  id, name, refreshToken, scopes }
async function makeRefreshTokenWithWebFlow ({
  clientId, clientSecret, redirectUri,
  scopes: desiredScopes, // renamed to avoid conflict with obtained scopes.
  callbackPath, localPort,
  verbose = false
}) {
  const oAuth2Client = new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri,
    forceRefreshOnFailure: true
  })

  const code = await getAuthorizationCode(oAuth2Client, callbackPath, localPort, desiredScopes)
  if (verbose) {
    console.debug(`Got the authorization code: ${code}`)
  }
  const { tokens } = await oAuth2Client.getToken(code)
  if (verbose) {
    console.debug('Got new tokens', { tokens })
  }
  oAuth2Client.setCredentials(tokens)

  // rename refresh_token: refreshToken, so we can return it in camelCase
  const { refresh_token: refreshToken } = tokens

  // I can get the id (renamed from sub) and scopes from the tokenInfo
  // But only if we have scope profile,openid, or "https://www.googleapis.com/auth/userinfo.profile"
  // if we don't have this scope id will be null
  const { sub: id, scopes } = await oAuth2Client.getTokenInfo(
    oAuth2Client.credentials.access_token
  )

  // Make sure we got all the scopes we wanted
  const scopesOk = await validateScope(scopes, desiredScopes)
  if (!scopesOk) {
    // Let's not make this fatal, validateScope prints warnings
    // throw new Error('Missing authorization scopes')
  }

  // The name (and also sub/id which is in above getTokenInfo) can be obtained from OAuth2 userinfo.
  // if we have request scope: "https://www.googleapis.com/auth/userinfo.profile"
  let name
  try {
    const { data } = await oAuth2Client.request({ url: 'https://www.googleapis.com/oauth2/v3/userinfo' })
    name = data.name
  } catch (err) {
    // insufficient scope to fetch name
  }

  // if (!id || !name) {
  //   console.warn('You might want to add `https://www.googleapis.com/auth/userinfo.profile` to your requested scopes to get `id` and `name` fields associated with this token')
  // }
  return { id, name, refreshToken, scopes }
}

// Returns tokens for Code
async function getTokensFromAuthorizationCode (oAuth2Client, code) {
  const r = await oAuth2Client.getToken(code)
  // console.debug({ r })
  return (r.tokens)
}

// get an authorization code for the Oauth2 client, from which access and refresh tokens may be obtained
async function getAuthorizationCode (oAuth2Client, callbackPath, localPort, scope = ['https://www.googleapis.com/auth/userinfo.profile']) {
  return new Promise((resolve, reject) => {
    const authorizeUrl = oAuth2Client.generateAuthUrl({
    // prompt: 'consent', // force consent, if a refresh token has already been emitted...
      access_type: 'offline',
      scope: scope
    })

    // TODO: add a timeout?
    // Open an http server to accept a single request: the oauth callback.
    const server = http
      .createServer(async (req, res) => {
        try {
          const incomingURL = new url.URL(req.url, `http://127.0.0.1:${localPort}`)
          // this should match: keys.web.redirect_uris[0] path part: e.g. /auth/google/callback
          if (callbackPath !== incomingURL.pathname) {
            console.warn(`Incoming url path: ${incomingURL.pathname} was expected to match redirect_uris[] path: ${callbackPath}}`)
          }

          const qs = incomingURL.searchParams
          const code = qs.get('code')

          if (!code) {
            throw new Error('Code not found in callback, return to console')
          }

          res.end('Authentication successful! Please return to the console.')
          server.destroy()
          resolve(code)
        } catch (e) {
          res.end('Authentication was not successful, Please return to console')
          server.destroy()
          reject(e)
        }
      })
      .listen(localPort, () => {
      // open the browser to the authorize url to start the workflow
        open(authorizeUrl, { wait: false }).then(cp => cp.unref())
      })

    // enhance server with a 'destroy' function
    enableDestroy(server)
  })
}
