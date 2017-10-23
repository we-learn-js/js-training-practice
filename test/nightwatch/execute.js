const {spawn} = require('child_process')
const {getSpawnPromise} = require('@s-ui/helpers/cli')

const serverProcess = spawn('webpack-dev-server', ['--port=4443']);

getSpawnPromise('rm', ['-Rf', './test/.screenshots'])
  .then(() => getSpawnPromise('nightwatch', ['--config ./test/nightwatch/config.js']))
  .then(() => serverProcess.kill('SIGINT'))
  .catch(() => {
    serverProcess.kill('SIGINT')
    process.exit(1)
  })
