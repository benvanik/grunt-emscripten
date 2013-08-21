/*
 * grunt-emscripten
 * https://github.com/benvanik/grunt-emscripten
 *
 * Copyright (c) 2013 Ben Vanik
 * Licensed under the MIT license.
 */

'use strict';

var child_process = require('child_process');
var fs = require('fs');
var path = require('path');
var temp = require('temp');
var util = require('util');

module.exports = function(grunt) {

  function exec(command, env, callback) {
    if (typeof command != 'string') {
      command = command.join(' ');
    }
    env = env || {};
    var exitCode = 0;

    grunt.verbose.subhead(command);
    grunt.verbose.writeln(util.format('Expecting exit code %d', exitCode));

    var child = child_process.exec(command, {
      env: env
    });

    child.stdout.on('data', function (d) { grunt.log.write(d); });
    child.stderr.on('data', function (d) { grunt.log.error(d); });

    child.on('exit', function(code) {
      if (code !== exitCode) {
        grunt.log.error(util.format('Exited with code: %d.', code));
        return callback(false);
      }

      grunt.verbose.ok(util.format('Exited with code: %d.', code));
      callback(true);
    });
  };

  grunt.registerMultiTask('emscripten', 'Emscripten build task.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      emcc: 'emcc',
      llvm: '/usr/local/bin/',
      includePaths: '',
      closure: undefined,
      o: undefined,
      g: undefined,
      llvmOpts: undefined,
      llvmLto: undefined,
      jcache: false,
      memoryInitFile: true,
      compilerOptions: {}
    });

    // Grab inputs and outputs.
    var includePaths = grunt.file.expand(options.includePaths);
    var sourceFiles = grunt.file.expand(this.data.srcs);
    var targetPath = this.data.dest;
    var targetFilePrefix = path.join(targetPath, this.target);

    // emcc requires a '.js' on the target.
    // We spit out things side-by-side with the real target so we can swap
    // at a time.
    var tempDir = temp.path() + '/';
    fs.mkdirSync(tempDir);
    var outputFilePrefix = path.join(tempDir,
        path.basename(targetFilePrefix + '.js'));

    // Construct command line.
    var command = [];
    command.push(options.emcc);
    command.push('-o ' + path.resolve(outputFilePrefix));
    if (options.closure !== undefined) {
      if (options.closure) {
        command.push('--closure 1');
      } else {
        command.push('--closure 0');
      }
    }
    if (options.o !== undefined) {
      command.push('-O' + options.o);
    }
    if (options.g !== undefined) {
      if (typeof options.g == 'number') {
        command.push('-g' + options.g);
      } else if (options.g) {
        command.push('-g');
      }
    }
    if (options.llvmOpts !== undefined) {
      command.push('--llvm-opts ' + options.llvmOpts);
    }
    if (options.llvmLto !== undefined) {
      command.push('--llvm-lto ' + options.llvmLto);
    }
    if (options.jcache) {
      command.push('--jcache');
    }
    if (options.memoryInitFile) {
      command.push('--memory-init-file 1');
    }
    for (var key in options.compilerOptions) {
      var value = options.compilerOptions[key];
      var safeValue = JSON.stringify(value).replace(/"/g, '\\"');
      command.push('-s "' + key + '=' + safeValue + '"');
    }
    includePaths.forEach(function(includePath) {
      //command.push('-I' + path.resolve(includePath));
      command.push('-I' + includePath);
    });
    sourceFiles.forEach(function(sourceFile) {
      command.push(path.resolve(sourceFile));
    });

    // Setup environment.
    var env = {};
    if (options.llvm) {
      env['LLVM'] = path.resolve(options.llvm);
    }

    // Execute.
    grunt.log.writeln('Running emcc to build ' + targetFilePrefix + '...');
    var done = this.async();
    exec(command, env, function(success) {
      // Copy files into their final locations.
      grunt.file.mkdir(targetPath);
      function copyIfExists(source, target, opt_options) {
        if (grunt.file.exists(source)) {
          // Source found, overwrite.
          grunt.file.copy(source, target, opt_options);
          // Delete temp file.
          fs.unlinkSync(source);
        } else if (grunt.file.exists(target)) {
          // Source not found, so delete target.
          grunt.file.delete(target);
        }
      };
      copyIfExists(outputFilePrefix, targetFilePrefix + '.js', {
        process: function(source) {
          // Rewrite paths in the js file to be relative.
          var prefix = process.cwd() + '/';
          var prefixExp = new RegExp(prefix, 'g');
          var result = source.replace(prefixExp, '');
          return result;
        }
      });
      copyIfExists(outputFilePrefix + '.mem', targetFilePrefix + '.js.mem');
      copyIfExists(outputFilePrefix + '.map', targetFilePrefix + '.js.map', {
        process: function(source) {
          // Rewrite paths in the map file to be relative.
          var prefix = process.cwd();
          var prefixExp = new RegExp(prefix, 'g');
          var result = source.replace(prefixExp, '');
          // Remove /tmp/ prefix.
          var tempExp = new RegExp(tempDir, 'g');
          result = result.replace(tempExp, '');
          return result;
        }
      });

      // Cleanup temp dir.
      fs.rmdirSync(tempDir);

      done(success);
    });
  });
};
