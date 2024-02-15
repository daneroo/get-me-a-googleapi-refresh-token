
const yargs = require('yargs')
const { validateArgs } = require('./setupCommand')
const { makeRefreshTokenWithWebFlow } = require('./auth')

module.exports = {
  command: 'generate',
  describe: 'generate a refresh token (this will start a server for the callback, and open a web page to initiate the OAuth2 web flow.)',
  builder: async (yargs) => { },
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
  if (argv.verbose) {
    validatedOptions.verbose = true
  }
  const { id, name, refreshToken, scopes } = await makeRefreshTokenWithWebFlow(validatedOptions)
  if (!id || !name) {
    console.warn('You might want to add `https://www.googleapis.com/auth/userinfo.profile` to your requested scopes to get `id` and `name` fields associated with this token')
  }
  console.debug(JSON.stringify({ id, name, refreshToken, scopes }, null, 2))

  // const refreshTokenDBEntry = await makeRefreshTokenWithWebFlow(keys, scope)
  // console.info(`Refresh token acquired. (${refreshTokenDBEntry.id})`)
  // console.debug('-', { refreshTokenDBEntry })

  // await fsPromises.writeFile(refreshTokenDBFile, JSON.stringify(refreshTokenDBEntry))
  // console.info('Refresh Token persisted.')
}
