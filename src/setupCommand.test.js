const { validateForLocalUse } = require('./setupCommand')

describe('Setup Validation options errors', () => {
  // negative cases: tightly coupled to error message: boo!
  const ok = { clientId: 'X', clientSecret: 'Y', redirectUri: 'http://127.0.0.1/Z', scopes: ['ascope'] }
  const missingError = { error: 'Missing at least one required parameter : `{clientId,clientSecret,redirectUri,scopes:[]}`' }
  test.each([
    [null, missingError],
    [{}, missingError],
    [{ clientId: '', clientSecret: '' }, missingError],
    [{ clientId: '', redirectUri: '' }, missingError],
    [{ clientSecret: '', redirectUri: '' }, missingError],
    [{ ...ok, scopes: 'not an array' }, { error: '`scopes` is not an Array' }],
    [{ ...ok, scopes: [] }, { error: 'Missing `scopes[]` entries' }],
    [{ ...ok, clientId: 42 }, { error: '`clientId` should be a string' }],
    [{ ...ok, clientSecret: 42 }, { error: '`clientSecret` should be a string' }],
    [{ ...ok, redirectUri: 42 }, { error: '`redirectUri` should be a string' }],
    [{ ...ok, scopes: ['a', 42, 'c'] }, { error: '`scopes[]` should all be strings' }],
    [{ ...ok, redirectURri 'https://somehost/path' }, { error: '`redirectUri` should start with http://127.0.0.1' }],
    [{ ...ok, redirectUri: 'http://localhost/path' }, { error: '`redirectUri` should start with http://127.0.0.1' }],
    [{ ...ok, redirectUri: 'http://127.0.0.1:NotAPortNumberN/path' }, { error: '`redirectUri` error:TypeError [ERR_INVALID_URL]: Invalid URL: http://127.0.0.1:NotAPortNumberN/path' }],
    [{ ...ok, redirectUri: 'http://127.0.0.1/pathAfterNoPort' }, { error: '`redirectUri` error:Error: http port should be explicit for redirectUri' }],
    [null, missingError]
  ])('.validateForLocalUse(%j) errors', (keys, expected) => {
    expect(validateForLocalUse(keys)).toEqual(expected)
  })
})

describe('Setup Validation params ok', () => {
  const ok = { clientId: 'X', clientSecret: 'Y', scopes: ['ascope'] }
  test.each([
    ['http://127.0.0.1:8080/auth/google/callback', { callbackPath: '/auth/google/callback', localPort: 8080, redirectUri: 'http://127.0.0.1:8080/auth/google/callback', ...ok }],
    ['http://127.0.0.1:3000/someotherpath', { callbackPath: '/someotherpath', localPort: 3000, redirectUri: 'http://127.0.0.1:3000/someotherpath', ...ok }]
  ])('.validateForLocalUse(%j)', (redirectUri, expected) => {
    const opts = { ...ok, redirectUri }
    expect(validateForLocalUse(opts)).toEqual(expected)
  })
})
