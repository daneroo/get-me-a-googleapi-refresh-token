
const yargs = require('yargs')
const { validateArgs } = require('./setupCommand')

module.exports = {
  command: 'generate',
  describe: 'generate a refresh token (this will start a server for the callback, and open a web page to initiate the OAuth2 web flow.)',
  builder: async (yargs) => { },
  handler
}

async function handler (argv) {
  // Call the Validation Command handler
  const validatetOptions = await validateArgs(argv)
  if (validatetOptions.error) {
    console.log(`Validation error from file: ${argv.keys}`)
    console.error(`Error: ${validatetOptions.error}\n\n`)
    yargs.showHelp()
  }

  console.info(`generate: ${JSON.stringify(validatetOptions)}`)
}
