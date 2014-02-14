/*global module:false*/
module.exports = function(grunt) {

  // show elapsed time at the end
  require('time-grunt')(grunt);

  // load all grunt tasks
  require('load-grunt-tasks')(grunt);


  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    meta: {
      bannerLocal: '/*! iFrame Resizer (jquery.iframeSizer.min.js ) - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' *  Desc: Force cross domain iframes to size to content.\n' +
        ' *  Requires: iframeSizer.contentWindow.min.js to be loaded into the target frame.\n' +
        ' *  Copyright: (c) <%= grunt.template.today("yyyy") %> David J. Bradshaw - dave@bradshaw.net\n' +
        ' *  License: MIT\n */\n',
      bannerRemote: '/*! iFrame Resizer (iframeSizer.contentWindow.min.js) - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' *  Desc: Include this file in any page being loaded into an iframe\n' +
        ' *        to force the iframe to resize to the content size.\n' +
        ' *  Requires: jquery.iframeSizer.min.js on host page.\n' +
        ' *  Copyright: (c) <%= grunt.template.today("yyyy") %> David J. Bradshaw - dave@bradshaw.net\n' +
        ' *  License: MIT\n */\n'
    },

    qunit: {
      files: ['test/*.html']
    },

    jshint: {
      options: {
          globals: {
          jQuery:false,
          require:true,
          process:true
        },
      },
      gruntfile: {
        src: 'gruntfile.js'
      },
      code: {
        src: 'src/**/*.js'
      },
    },

    uglify: {
      options: {
        sourceMaps:true,
        sourceMapIncludeSources:true,
        report:'gzip',
      },
      local: {
        options:{
          banner:'<%= meta.bannerLocal %>',
          sourceMap: 'src/jquery.iframeResizer.map'
        },
        src: ['src/jquery.iframeResizer.js'],
        dest: 'js/jquery.iframeResizer.min.js',
      },
      remote: {
        options: {
          banner:'<%= meta.bannerRemote %>',
          sourceMap: 'src/iframeResizer.contentWindow.map'
        },
        src: ['src/iframeResizer.contentWindow.js'],
        dest: 'js/iframeResizer.contentWindow.min.js',
      }
    },

    watch: {
      files: ['src/**/*'],
      tasks: 'sefault'
    },

    replace: {
      min: {
        src: ['js/*.min.js'],
        overwrite: true,
        replacements: [{
          from: /sourceMappingURL=src\//g,
          to: 'sourceMappingURL=..\/src\/'
        }]
      },

      map: {
        src: ['src/*.map'],
        overwrite: true,
        replacements: [{
          from: /src\//g,
          to: ''
        }]
      }
    },

    bump: {
      options: {
        files: ['package.json','bower.json','iframeResizer.jquery.json'],
        updateConfigs: ['pkg'],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['-a'], // '-a' for all files
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'origin',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
      }
    },

    shell: {
      options:{
        stdout: true,
        stderr: true,
        failOnError: true
      },
      deployExample: {
        command: function(){

          var
            retStr = '',
            fs = require('fs');

          if (fs.existsSync('bin')) {
              retStr = 'bin/deploy.sh';
          }

          return retStr;
        }
      }
    }

  });

  grunt.registerTask('default', ['notest','qunit']);
  grunt.registerTask('notest',  ['jshint','uglify','replace']);
  grunt.registerTask('test',    ['jshint','qunit']);

  grunt.registerTask('postBump',['uglify','replace','bump-commit','shell']);
  grunt.registerTask('patch',   ['default','bump-only:patch','postBump']);
  grunt.registerTask('minor',   ['default','bump-only:minor','postBump']);
  grunt.registerTask('major',   ['default','bump-only:major','postBump']);

};
