module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine-jquery', 'jasmine', 'requirejs'],

    // Karma will require() these plugins
    /*
    plugins: [
      'logcapture',
      'karma-verbose-summary-reporter',
      'karma-jasmine',
      'karma-chrome-launcher'
    ],
    */

    // list of files / patterns to load in the browser
    files: [
      'test-main.js',
      'spec/lib/*.js',
      { pattern: 'js/*.js', included: false },
      { pattern: 'test-js/*.js', included: false },
      { pattern: 'dist/parent/*.js', included: false },
      { pattern: 'dist/child/*.js', included: false },
      { pattern: 'dist/jquery/*.js', included: false },
      { pattern: 'dist/legacy/*.js', included: false },
      { pattern: 'dist/legacy/js/*.js', included: false },
      // { pattern: 'packages/*.js', included: false },
      { pattern: 'example/html/*.html', included: false },
      { pattern: 'example/html/child/*.html', included: false },
      { pattern: 'spec/*Spec.js', included: false },
      { pattern: 'spec/resources/*', included: false },
      { pattern: 'spec/javascripts/fixtures/*.html', included: false },
    ],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'js/*.js': ['coverage'],
    },

    coverageReporter: {
      type: 'html',
      dir: 'coverage/',
    },

    client: {
      captureConsole: true,
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['logcapture', 'progress', /* 'verbose-summary', */ 'coverage'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    autoWatch: false,
    // singleRun: false, // Karma captures browsers, runs the tests and exits
    concurrency: Infinity,
  })
}
