// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');
const jasmineReporters = require('jasmine-reporters');
/**
 * @type { import("protractor").Config }
 */
exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './src/**/*.e2e-spec.ts'
  ],
  capabilities: {
    chromeOptions: {
      args: [ "--headless", "--no-sandbox", "--lang=PT" ]
    },
    browserName: 'chrome'
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
    jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
      savePath: 'reports/e2e/',
      consolidateAll: true,
      filePrefix: 'e2e-test-report'
    }));
  }
};