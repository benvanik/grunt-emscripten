# grunt-emscripten

> Emscripten build tasks.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-emscripten --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-emscripten');
```

## The "emscripten" task

### Overview
In your project's Gruntfile, add a section named `emscripten` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  emscripten: {
    options: {
      // Compiler options
    },
    <output>: {
      srcs: [...],
      dest: 'build/'
    },
  },
})
```

### Options
Most of the options are based on the command line options for `emcc`, documented in the
[emscripten documentation](https://kripken.github.io/emscripten-site/docs/tools_reference/emcc.html)

- **emcc:** (`String`, Default: `'emcc'`) Name of `emcc` executable
- **llvm:** (`String`, Default: `'/usr/local/bin/'`) Path to search for llvm
- **includePaths:** (`String | String[]`, Default: `''`)
- **closure:** (`Number`) `--closure 0/1/2`
- **o:** (`Number`) Set optimization level `-O0` .. `-O3` 
- **g:** (`Number`) Set debug level `-g0` .. `-g4`
- **llvmOpts:** (`String`) `--llvmOpts ...`
- **llvmLto:** (`String`) `--llvmLto ...`
- **jcache:** false,
- **memoryInitFile:** (`true`) `--memory-init-file 0/1`
- **compilerOptions:** (`{}`) Object containing `-s <key>=<value>` arguments. See
  [emscripten/src/settings.js](https://github.com/kripken/emscripten/blob/master/src/settings.js)
  for detailed options.
- **defines:** (`{}`) Object containing `-D <key>=<value>` arguments

### Inputs and Outputs
- **srcs:** Source files
- **preJsSrcs:** `--pre-js`
- **postJsSrcs:** `--post-js`
- **dest:** output directory. The output filename is based on the target name.

### Example Usage
```js
grunt.initConfig({
  emscripten: {
    output: {
      options: {
        memoryInitFile: false
        o: 3
      },
      srcs: 'src/*.c',
      dest: 'build/'
    },
  },
})
```

This will run `emcc` with flags `--memory-init-file 0` and `-O3` on all
`*.c` files in `src/` and write the output to `build/output.js`

## Release History
_(Nothing yet)_
