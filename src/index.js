#!/usr/bin/env node

const yargs = require('yargs')
// const { usingRefreshToken, validateScope, makeRefreshTokenWithWebFlow } = require('./auth')
const setupCommand = require('./setupCommand')
const generateCommand = require('./generateCommand')

yargs // eslint-disable-line
  .command(setupCommand) // default command - validates configuration
  .command(generateCommand)
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
