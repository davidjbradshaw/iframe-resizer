const allTestFiles = []

const TEST_REGEXP = /(spec|test)\.js$/i

// Get a list of all the test files to include
// eslint-disable-next-line no-underscore-dangle
Object.keys(window.__karma__.files).forEach((file) => {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
    // then do not normalize the paths
    const normalizedTestModule = file.replaceAll(/^\/base\/|\.js$/g, '')
    allTestFiles.push(normalizedTestModule)
  }
})

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base',

  paths: {
    jquery: 'node_modules/jquery/dist/jquery',
    iframeResizer: 'js/iframeResizer.parent',
    iframeResizerContent: 'js/iframeResizer.child',
    iframeResizerParent: 'js/iframeResizer.parent',
    iframeResizerJquery: 'js/iframeResizer.parent.jquery',
    iframeResizerChild: 'js/iframeResizer.child',
  },

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start, // eslint-disable-line no-underscore-dangle
})
