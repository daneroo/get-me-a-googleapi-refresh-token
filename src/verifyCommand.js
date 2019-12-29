
const yargs = require('yargs')
const { validateArgs } = require('./setupCommand')
const { usingRefreshToken } = require('./auth')

module.exports = {
  command: 'verify <token>',
  describe: 'verify a refresh token',
  builder: (yargs) => {
    yargs
      .positional('token', {
        describe: 'a refresh token to validate'
      })
  },
  handler
}

async function handler (argv) {
  // Call the Validation Command handler
  const validatedOptions = await validateArgs(argv)
  if (validatedOptions.error) {
    console.log(`Validation error from file: ${argv.keys}`)
    console.error(`Error: ${validatedOptions.error}\n\n`)
    yargs.showHelp()
    return
  }

  validatedOptions.refreshToken = argv.token

  if (argv.verbose) {
    validatedOptions.verbose = true
    console.debug(`verify token:${validatedOptions.refreshToken}`)
  }

  // TODO: add optional validation to usingRefreshToken)
  const oAuth2Client = await usingRefreshToken(validatedOptions, argv.token)
  console.info('Client acquired.')

  {
    console.log('Calling OAuth userInfo - to validate token')
    const url = 'https://www.googleapis.com/oauth2/v3/userinfo'
    const { data: { name, sub: id } } = await oAuth2Client.request({ url })
    console.log(`Worked cause I know your name:${name} (${id})`)
  }
  {
    console.log('Calling People API - to validate token')
    const url = 'https://people.googleapis.com/v1/people/me?personFields=names'
    const { data: { resourceName, names } } = await oAuth2Client.request({ url })
    console.log(`Worked cause I know your name:${names[0].displayName} (${resourceName})`)
  }
  {
    const url = 'https://photoslibrary.googleapis.com/v1/mediaItems'
    const { data: { mediaItems, nextPageToken } } = await oAuth2Client.request({ url })
    console.log(`Photos: ${mediaItems.length} next:${nextPageToken.substr(0, 6)}...`)
  }
}
