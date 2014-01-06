/*global module:false*/
module.exports = function(grunt) {


    // show elapsed time at the end
    require('time-grunt')(grunt);


    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    meta: {
      version: '1.0.0',
      bannerHost: '/*! iFrame Resizer (jquery.iframeSizer.min.js ) - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' *  Desc: Force cross domain iframes to size to content.\n' +
        ' *  Requires: iframeSizer.contentWindow.min.js to be loaded into the target frame.\n' +
        ' *  Copyright: (c) <%= grunt.template.today("yyyy") %> David J. Bradshaw - dave@bradshaw.net\n' +
        ' *  License: MIT and GPL\n */\n',
      bannerIframe: '/*! iFrame Resizer (iframeSizer.contentWindow.min.js) - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' *  Desc: Include this file in any page being loaded into an iframe\n' +
        ' *        to force the iframe to resize to the content size.\n' +
        ' *  Requires: jquery.iframeSizer.min.js on host page.\n' +
        ' *  Copyright: (c) <%= grunt.template.today("yyyy") %> David J. Bradshaw - dave@bradshaw.net\n' +
        ' *  License: MIT and GPL\n */\n'
    },
    lint: {
      files: ['src/*.js']
    },
    qunit: {
      files: ['test/**/*.html']
    },
    jshint: {
      options: {
      },
      globals: {
        jQuery:false,
        require:true,
        process:true
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      code: {
        src: 'src/**'
      },
    },
    uglify: {
      options: {
      },
      local: {
        src: ['<banner:meta.bannerHost>','src/jquery.iframeResizer.js'],
        dest: 'js/jquery.iframeResizer.min.js'
      },
      remote: {
        src: ['<banner:meta.bannerIframe>','src/iframeResizer.contentWindow.js'],
        dest: 'js/iframeResizer.contentWindow.min.js'
      }
    },
    watch: {
      files: ['src/**/*'],
      tasks: 'sefault'
    }
  });


  grunt.registerTask('default', ['jshint','uglify']);

};
