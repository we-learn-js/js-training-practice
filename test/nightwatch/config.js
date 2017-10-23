module.exports = {
  "src_folders": ["test"],
  "output_folder": false,
  "test_workers": false,
  "live_output": true,
  "test_runner" : {
    "type" : "mocha"
  },
  "selenium": {
    "start_process": true,
    "server_path": require('selenium-server-standalone-jar').path,
    "port": 4444,
    "cli_args": {
      "webdriver.chrome.driver": require('chromedriver').path
    }
  },
  "test_settings": {
    "default": {
      "screenshots" : {
        "enabled" : true,
        "on_failure" : true,
        "on_error" : true,
        "path" : "./test/.screenshots"
      },
      "launch_url": "http://localhost:4443",
      "selenium_port": 4444,
      "selenium_host": "localhost",
      "silent": true,
      "filter" : "test/*.spec.js",
      "desiredCapabilities": {
        "browserName": "chrome",
        "chromeOptions" : {
           "args" : ["headless"]
        }
      }
    }
  }
}
