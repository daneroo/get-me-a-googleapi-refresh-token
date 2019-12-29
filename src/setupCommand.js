
const fsPromises = require('fs').promises
const url = require('url')
const yargs = require('yargs')

module.exports = {
  command: ['setup', '$0'],
  describe: 'validate setup',
  builder: async (yargs) => { },
  handler,
  validateArgs,
  validateForLocalUse
}

async function handler (argv) {
  const { error } = await validateArgs(argv)
  if (error) {
    console.log(`Validation error from file: ${argv.keys}`)
    console.error(`Error: ${error}\n\n`)
    yargs.showHelp()
  } else {
    console.log(`Validated setup from json file:OK (${argv.keys})`)
  }
}

// validateArgs returns either of:
// - {clientId,clientSecret,redirecURI,scopes}
// - {error:message}
// It is isolated and exported so it can be used from other commands
async function validateArgs (argv) {
  try {
    await fsPromises.access(argv.keys)
  } catch (err) {
    return { error: `Keys file not found: (${argv.keys})` }
  }
  try {
    const options = JSON.parse(await fsPromises.readFile(argv.keys))
    const isObject = options && !Array.isArray(options) && typeof options === 'object'
    if (!isObject) {
      return { error: `Keys file should be an json object ({..}) (${argv.keys})` }
    }

    const validatedOptions = validateForLocalUse(options)
    if (validatedOptions.error) {
      return { error: validatedOptions.error }
    }

    return validatedOptions
  } catch (err) {
    return { error: `Could not parse keys file as json: ${argv.keys}` }
  }
  // unreachable
}

// validate that the keys object is valid for a local (127.0.0.1) OAuth2 flow.
// Has the shape:
// {
//   "web": {
//     "clientId": "9383849493-lmnbxcbksjhedcksbdkjchb.apps.googleusercontent.com",
//     "clientSecret": "XYSYDHEKJHD",
//     "redirectURI": "http://127.0.0.1:8080/auth/google/callback"
//     "scopes":["atLeastOneScope"]
//   }
// }
// Returns the expected path and port for first local rediect_uri
// return {
//   callbackPath:'/some/callback/path',
//   localPort:8080
//   redirectURI:http://127.0.0.1:8080/auth/google/callback
//   scopes:["atLeastOneScope"]
// }
//   or an error
// return {
//   error: "If there was an error"
// }
function validateForLocalUse (opts) {
  if (!opts || !opts.clientId || !opts.clientSecret || !opts.redirectURI || !opts.scopes) {
    return { error: 'Missing at least one required parameter : `{clientId,clientSecret,redirectURI,scopes:[]}`' }
  }
  if (!Array.isArray(opts.scopes)) {
    return { error: '`scopes` is not an Array' }
  }
  if (!opts.scopes.length > 0) {
    return { error: 'Missing `scopes[]` entries' }
  }
  // clientId,clientSecret,redirectURI should all be strings
  for (const prop of ['clientId', 'clientSecret', 'redirectURI']) {
    if (typeof opts[prop] !== 'string') {
      return { error: `\`${prop}\` should be a string` }
    }
  }
  // entries of scopes[] should all be strings
  for (const scope of opts.scopes) {
    if (typeof scope !== 'string') {
      return { error: '`scopes[]` should all be strings' }
    }
  }
  // validate content: proper redirectURI path and port
  if (!opts.redirectURI.startsWith('http://127.0.0.1')) {
    return { error: '`redirectURI` should start with http://127.0.0.1' }
  }
  try {
    const redirectUri = opts.redirectURI
    const u = new url.URL(redirectUri)
    const callbackPath = u.pathname
    const localPort = Number(u.port)
    if (localPort === 0) {
      throw new Error('http port should be explicit for redirectURI')
    }
    return {
      redirectUri,
      callbackPath,
      localPort
    }
  } catch (err) {
    return { error: '`redirectURI` ' + `error:${err}` }
  }
}
