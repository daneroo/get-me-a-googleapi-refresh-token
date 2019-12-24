#!/usr/bin/env node

const yargs = require('yargs')
const { usingRefreshToken, validateScope, makeRefreshTokenWithWebFlow } = require('./auth')
const fsPromises = require('fs').promises

// Download your OAuth2 configuration from the Google Console/APIs ad Services/Credentials
const refreshTokenDBFile = './refreshTokenDB.json'
const keys = require('../oauth2.keys.json')
const scope = [
  'https://www.googleapis.com/auth/userinfo.profile', // so I can get name
  'https://www.googleapis.com/auth/photoslibrary.readonly'
]

yargs // eslint-disable-line
  .command(['setup', '$0'], 'validate setup', async (yargs) => {
    // default command
  }, async (argv) => {
    const { error } = await validateSetup(argv)
    if (error) {
      console.error(`Error: ${error}\n\n`)
      yargs.showHelp()
    }
  })
  .command('generate',
    'generate a refresh token (this will start a server for the callback, and open a web page to initiate the OAuth2 web flow.)',
    (yargs) => {}, // builder
    async (argv) => { // handler
      const setup = await validateSetup(argv)
      console.info(`generate: ${JSON.stringify(setup)}`)
    })
  .command('validate <token>', 'validate a refresh token', (yargs) => {
    yargs
      .positional('refresh-token', {
        describe: 'a refresh token to validate'
      })
  }, (argv) => {
    console.info(`generate ${42}`)
    if (argv.verbose) console.info(`generate verbosely ${42}`)
  })
  .options({
    verbose: {
      alias: 'v',
      describe: 'Run with verbose logging'
    },
    keys: {
      alias: 'k',
      describe: `Provide a path to a json file with the following content:
      {
        "client_id": "MY_CLIENT_ID',
        "client_secret":"MY_CLIENT_SECRET',
        "redirect_uris":["http://127.0.0.1:8080/somepath"]
      }`,
      default: 'oauth2.keys.json'
    }
  })
  .demandCommand(1, 'You need at least one command before moving on')
  .epilogue(' * You should NOT check in your oauth2.keys.json file into version control!! *')
  .help()
  .argv

// validateSetup returns either of:
// - {clientId,clientSecret,redirecURI}
// - {error:message}
async function validateSetup (argv) {
  console.log('Validating setup...')
  try {
    await fsPromises.access(argv.keys)
    console.log(`- Keys file exists ${argv.keys}`)
  } catch (err) {
    return { error: `Keys file note found: (${argv.keys})` }
  }
  try {
    const validatedObject = {
      clientId: null,
      clientSecret: null,
      redirectURI: null
    }
    const json = JSON.parse(await fsPromises.readFile(argv.keys))
    console.log('- Keys file is valid json', typeof json)
    const isObject = json && !Array.isArray(json) && typeof json === 'object'
    if (!isObject) {
      return { error: `Keys file json should be an object ({..}) (${argv.keys})` }
    }
    if (json.clientId || json.client_id) {
      validatedObject.clientId = json.clientId || json.client_id
      console.log('- Found clientId')
    } else {
      return { error: `Keys file: clientId not found (${argv.keys})` }
    }
    if (json.clientSecret || json.client_secret) {
      console.log('- Found clientSecret')
      validatedObject.clientSecret = json.clientSecret || json.client_secret
    } else {
      return { error: `Keys file: clientSecret not found (${argv.keys})` }
    }
    if (json.redirectURI) {
      console.log('- Found redirectURI')
      validatedObject.redirectURI = json.redirectURI
    } else {
      return { error: `Keys file: redirectURI not found (${argv.keys})` }
    }
    return validatedObject
  } catch (err) {
    return { error: `Could not parse keys file as json: ${argv.keys}` }
  }
  // unreachable
}
/**
 * Start by acquiring a pre-authenticated oAuth2 client.
 */
// async function main () {
//   const renew = true
//   const verify = true
//   // First Part get an authenticaed OAuth2 token - and serialize it to file
//   if (renew) {
//     // const { tokens, tokenInfo } = await makeRefreshTokenWithWebFlow(keys, scope)
//     const refreshTokenDBEntry = await makeRefreshTokenWithWebFlow(keys, scope)
//     console.info(`Refresh token acquired. (${refreshTokenDBEntry.id})`)
//     // console.debug('-', { refreshTokenDBEntry })

//     await fsPromises.writeFile(refreshTokenDBFile, JSON.stringify(refreshTokenDBEntry))
//     console.info('Refresh Token persisted.')
//   }

//   // Second part de-seraialze the token and us it to make an authenticaed API call
//   if (verify) {
//     const { refreshToken } = JSON.parse(await fsPromises.readFile(refreshTokenDBFile))
//     console.info('Refresh token read.')

//     // TODO: add optional validation to usingRefreshToken)
//     const oAuth2Client = await usingRefreshToken(keys, refreshToken)
//     console.info('Client acquired.')

//     const scopesOk = await validateScope(oAuth2Client, scope)
//     if (!scopesOk) {
//       throw new Error('Missing authorization scopes')
//     }

//     {
//       console.log('Calling OAuth userInfo - to validate token')
//       const url = 'https://www.googleapis.com/oauth2/v3/userinfo'
//       const { data: { name, sub: id } } = await oAuth2Client.request({ url })
//       console.log(`Worked cause I know your name:${name} (${id})`)
//     }
//     {
//       console.log('Calling People API - to validate token')
//       const url = 'https://people.googleapis.com/v1/people/me?personFields=names'
//       const { data: { resourceName, names } } = await oAuth2Client.request({ url })
//       console.log(`Worked cause I know your name:${names[0].displayName} (${resourceName})`)
//     }
//   }
//   await listItems()
// }
