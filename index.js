/**
 * A helper for my project gulpfiles.
 */

// My core library.
const core = require('@lumjs/core');

// Gulp is obviously always required.
const gulp = require('gulp');

// And we're assuming `del` will be as well.
const del  = require('del');

// Some constants for type checks.
const {F,S,O,isObj} = core.types;

// A helper function for object paths.
const getObjPath = core.obj.getObjectPath;

// Libraries that can be auto-loaded as required.
const DEPS =
{
  BABEL:   'gulp-babel',
  FCACHE:  'gulp-file-cache',
  CONNECT: 'gulp-connect',
  TERSER:  'gulp-terser',
  CSSMIN:  'gulp-clean-css',
  SRCMAP:  'gulp-sourcemaps',
  CONCAT:  'gulp-concat',
}

// Specific SASS libraries.
const SASS =
{
  DEP: 'gulp-sass', // The gulp plugin.
  LIB: 'sass',      // The underlying compiler.
}

// Custom loader functions, managed statically.
// Keys are the library name, and value is the function.
// The function will be passed the library name as the sole
// parameter.
const LoaderFunctions = {};

// One such loader function for the SASS compiler plugin.
LoaderFunctions[SASS.DEP] = dep => require(dep)(require(SASS.LIB));

// Default options that will be used when a new instance is created.
const DEFAULT_OPTS =
{ // option     default value
  sourcemaps:   true,
  lastRun:      true,
  connect:      false,
  maps:         {use: true, path: 'maps', init: {}, write: {}},
  babel:        false,
  ext:          '.js',
}

// A shared instance of the GulpHelper class.
let globalInstance = null;

/**
 * A class to help with common gulp tasks.
 */
class GulpHelper
{
  constructor()
  {
    this.tasks  = {};
    this.caches = {};
    this.dests  = {};
    this.deps   = {gulp, del};
    this.$curId = null;

    // Use the default options.
    this.reset();
  }

  /**
   * Get (or create) a shared instance.
   */
  static getInstance()
  {
    if (globalInstance === null)
    { // Create a new instance.
      globalInstance = new GulpHelper();
    }
    return globalInstance;
  }

  /**
   * Register a dependency loader function.
   *
   * @param {string} name - The name of the library.
   * @param {function} loader - The loader function.
   *
   * The `loader` will be passed the name of the library when called,
   * so a single loader function could potentially be assigned to
   * multiple library names.
   *
   */
  static registerLoader(name, loader)
  {
    if (typeof name !== S)
      throw new TypeError("name must be string");
    if (typeof loader !== F)
      throw new TypeError("loader must be function");
    LoaderFunctions[name] = loader;
  }

  /**
   * Remove a previously registered dependency loader function.
   *
   * @param {string} name - The name of the library.
   */
  static unregisterLoader(name)
  {
    if (typeof name !== S)
      throw new TypeError("name must be string");
    delete(LoaderFunctions[name]);
  }

  /**
   * Reset all instance options back to the defaults.
   */
  reset()
  {
    this.opts = JSON.parse(JSON.stringify(DEFAULT_OPTS));
    return this;
  }

  /**
   * Set an instance option.
   *
   * Don't use this to set nested object properties.
   * Use the `setAll()` method instead.
   *
   * @param {string} name - If a string, it's the name of the option.
   * @param {*} value - The value to set the option to.
   *
   * @returns {this}
   */
  set(name, value)
  {
    this.opts[name] = value;
    return this;
  }

  /**
   * Set recursive instance options.
   *
   * @param {object} values - Options to set.
   *
   * Options that are objects will be set recursively, so it's possible
   * to set one specific sub-option without changing all sub-options.
   *
   * If you want to override *all* properties, just use `set()` instead,
   * as it's faster and doesn't require recursive object depth.
   *
   * @returns {this}
   */
  setAll(values)
  {
    if (!isObj(values))
      throw new TypeError("values must be a plain object");
    core.obj.mergeNested(values, this.opts);
    return this;
  }

  /**
   * Get an instance option.
   *
   * @param {string} name - The name of the option.
   *   You can specify nested option names using a dot between the names.
   *
   * @param {*} [defvalue] A default value if the option was not set.
   *
   * If the instance options value is set to `null` or `undefined`, then
   * the `defvalue` will be used instead. If it's left unspecified it will
   * be `undefined` as well.
   *
   * @return {*} Either the option value, or the `defvalue`.
   */
  get(name, defvalue)
  {
    return getObjPath(this.opts, name, {default: defvalue});
  }

  /**
   * Look for an option in an object.
   *
   * First it looks in the object for the property name, and if found uses it.
   * If it was not found, passes the `name` and `defvalue` arguments over
   * to the `get()` method to look in our instance options.
   *
   * This is used internally by any method that uses named options.
   *
   * @param {object} opts - The options object to look in.
   * @param {string} name - The name (or dotted path) of the option to find.
   * @param {*} [defvalue] A last-effort default value.
   *
   * @returns {*} The option value from whatever source was first.
   */
  opt(opts, name, defvalue)
  {
    if (!isObj(opts))
      throw new TypeError("opts must be a plain object");

    return getObjPath(opts, name) ?? this.get(name, defvalue);
  }

  /**
   * If a library has not been loaded yet, do so.
   *
   * If a custom loader function for the library is defined,
   * it will be called with the name of the library passed to it.
   * Otherwise we simply use the default Node.js `require(lib)` method
   * to load the library and assign it to the dependency list.
   *
   * @param {string} name - The name of the library.
   *
   * @returns {(object|function)} The library object or function.
   */
  require(lib)
  {
    if (this.deps[lib] === undefined)
    { // Not loaded yet, let's fix that.
      this.deps[lib] 
        = (typeof LoaderFunctions[lib] === F)
        ? LoaderFunctions[lib](lib)
        : require(lib);
    }
    return this.deps[lib];
  }

  /**
   * Require a bunch of libraries at once.
   *
   * @param {...string} lib - The libraries to load into `deps` property.
   *
   * @return {this}
   */
  requires()
  {
    for (const arg of arguments)
    {
      this.require(arg);
    }
    return this;
  }

  /**
   * Set the current *id tag*  used for subsequent methods.
   *
   * @param {string} id - The id tag to be used.
   *
   * @returns {this}
   */
  tag(id)
  {
    this.$curId = id;
    return this;
  }

  /**
   * Create and assign a `gulp-file-cache` instance for the current *id tag*.
   *
   * @param {string} filename - The path to the cache file to use.
   *
   * @returns {this}
   */
  cache(filename)
  {
    const FileCache = this.require(DEPS.FCACHE);
    const id = this.$curId;
    filename = filename || '.gulp-cache-'+id;
    const cache = this.caches[id] = new FileCache(filename);
    cache.file = filename;
    return this;
  }

  /**
   * Set the destination path for the current *id tag*.
   *
   * @param {(string|string[])} path - The output path(s).
   *
   * For a single build target where we have output to be sent using
   * the `gulp.dest()` method, this should always be a string.
   *
   * The only time an `Array` makes sense is if it's a method that will
   * have only a `clean` task associated with it, and there's multiple files
   * and/or directories to clean.
   *
   * @returns {this}
   */
  dest(path)
  {
    const id = this.$curId;
    this.dests[id] = path;
    return this;
  }

  /**
   * A method to be called by a gulp task to delete build files.
   *
   * Uses the `del` library function to perform the deletions.
   *
   * This is generally never needed to be called directly.
   * See the `addClean()` method instead which adds a gulp task to call this.
   *
   * @param {string} id - The *id tag* to clean up.
   *
   * Must have already set up the *id tag* using the `tag()` and `dest()`
   * methods at the very least for this to work.
   *
   * @returns {*} The output from the `del()` function call.
   */
  cleanTask(id)
  {
    const remove = [];
    if (this.caches[id])
    {
      const cache = this.caches[id];
      cache.clear();
      remove.push(cache.file);
    }

    if (this.dests[id])
    {
      const out = this.dests[id];
      if (Array.isArray(out))
        remove.push(...out);
      else
        remove.push(out);
    }

    return del(remove);
  } // cleanTask()

  $useMaps(opts)
  {
    const maps = 
    { // Only one setting is mandatory.
      use: this.opt(opts, 'maps.use'),
      plugin: null,
      path: null,
      init: null,
      opts: null,
    }

    if (maps.use)
    { // The rest depend on that one being set.
      maps.plugin = this.require(DEPS.SRCMAP);
      maps.path = this.opt(opts, 'maps.path');
      maps.init = this.opt(opts, 'maps.init', {});
      maps.opts = this.opt(opts, 'maps.write', {});
    }

    return maps;
  }

  $connect(stream, opts)
  {
    if (this.opt(opts, 'connect'))
    {
      const connect = this.require(DEPS.CONNECT);
      stream = stream.pipe(connect.reload());
    }
    return stream;
  }

  $getSources(opts)
  {
    if (opts.sources !== undefined)
    { // We directly specified the sources.
      return opts.sources;
    }
    else if (typeof opts.path === S && Array.isArray(opts.files))
    { // We're going to generate a list of sources.
      const ext = this.opt(opts, 'ext', '.js');
      const {path,files} = opts;
      return files.map(value => path+value+ext);
    }
    else 
    { // Those are the only two currently supported methods.
      throw new Error("No valid sources for task found");
    }
  }

  $getSourceStream(opts, name, sources)
  {
    if (sources === undefined)
      sources = this.$getSources(opts);

    const rules = opts.rules ?? {};
    const lastRun = opts.lastRun ?? true;
    if (lastRun)
    { // Add a since rule.
      rules.since = gulp.lastRun(name);
    }

    //console.debug("$getSourceStream", name, sources, rules, opts);

    return gulp.src(sources, rules);
  }

  /**
   * A method to be called by a gulp task to build JS files.
   *
   * Uses `gulp-terser` to minimize the JS file.
   *
   * If `cache()` was called on the specified *id tag*, will also use the
   * file cache to optimize the build process further.
   *
   * Like with `cleanTask()` you probably don't need to call this manually,
   * as you can use the `addJS()` method to handle most of the features.
   *
   * @param {string} id - The *id tag* to find build parameters from.
   *
   * @param {string} name - The *gulp task* to check with `gulp.lastRun()`
   *
   * @param {object} [opts] Named options that can change the behaviours.
   * @param {object} [opts.maps] Sourcemap parameters.
   * @param {boolean} [opts.maps.use=true] Enable sourcemaps?
   * @param {object} [opts.maps.init] Options for `sourcemap.init()`
   * @param {?string} [opts.maps.path] Path for `sourcemap.write()`
   * @param {object} [opts.maps.write] Options for `sourcemap.write()`
   *
   * @param {string} [opts.rules={}] Rules to pass to `gulp.src`.
   * @param {boolean} [opts.lastRun=true] Should we add a `since` rule?
   *   If true, a `since` option with the value from `gulp.lastRun(name)`
   *   will be added to the `rules` object.
   *
   * @param {(boolean|object)} [opts.babel] Use Babel to transpile the JS?
   *   If a boolean `true` we'll use the default babel presets.
   *   If it's an object, we assume it's the options for babel.
   *   Anything else, we don't use babel at all.
   *
   * TODO: finish the documentation.
   */
  jsTask(id, name, opts)
  {
    const maps = this.$useMaps(opts);

    const cache = opts.cache ?? this.caches[id];
    const dest  = this.dests[id];

    const useBabel = this.opt(opts, 'babel');

    //console.debug("jsTask:pre:getSourceStream", id, name, opts);

    let stream = this.$getSourceStream(opts, name);

    if (cache)
      stream = stream.pipe(cache.filter());

    if (maps.use)
      stream = stream.pipe(maps.plugin.init(maps.init));

    if (typeof opts.concat === S)
    {
      const concat = this.require(DEPS.CONCAT);
      stream = stream.pipe(concat(opts.concat));
    }

    if (useBabel)
    { // Transpile.
      const babelOpts 
        = isObj(useBabel)
        ? useBabel
        : {presets:['@babel/env']};

      const babel = this.require(DEPS.BABEL);
      stream = stream.pipe(babel(babelOpts));
    }

    // We always run terser.
    const terser = this.require(DEPS.TERSER);
    stream = stream.pipe(terser());

    if (cache)
      stream = stream.pipe(cache.cache());

    if (maps.use)
      stream = stream.pipe(maps.plugin.write(maps.path, maps.write));

    // And we always run dest.
    stream = stream.pipe(gulp.dest(dest));

    // All done, return it, checking for connect use.
    return this.$connect(stream, opts);;
  }

  /**
   * Like jsTask, but for CSS.
   *
   * Supports most of the same options.
   * TODO: document this.
   */
  cssTask(id, name, opts)
  {
    const maps = this.$useMaps(opts);
 
    const cache = opts.cache ?? this.caches[id];
    const dest  = this.dests[id];

    let stream = this.$getSourceStream(opts, name);

    if (cache)
      stream = stream.pipe(cache.filter());

    if (maps.use)
      stream = stream.pipe(maps.plugin.init(maps.init));

    const sass = this.require(SASS.DEP);
    const cssmin = this.require(DEPS.CSSMIN);

    stream = stream.pipe(sass()).pipe(cssmin());

    if (cache)
      stream = stream.pipe(cache.cache());

    if (maps.use)
      stream = stream.pipe(maps.plugin.write(maps.path, maps.write));
 
    stream = stream.pipe(gulp.dest(dest));

    return this.$connect(stream, opts);
  }

  add(name, def)
  {
    this.tasks[name] = def;
    gulp.task(name, def);
    return this;
  }

  addClean(name)
  {
    const id = this.$curId;
    name = name || 'clean-'+id;
    return this.add(name, () => this.cleanTask(id));
  }

  addCSS(opts={})
  {
    const id = opts.id ?? this.$curId;
    const name = opts.name || 'build-'+id;

    return this.add(name, () => this.cssTask(id, name, opts));
  }

  addJS(opts={})
  {
    const id = opts.id ?? this.$curId;
    const name = opts.name || 'build-'+id;

    return this.add(name, () => this.jsTask(id, name, opts));
  }

  parallel(name, ...tasks)
  {
    return this.add(name, gulp.parallel(...tasks));
  }

  series(name, ...tasks)
  {
    return this.add(name, gulp.series(...tasks));
  }

  alias(alias, existing)
  {
    if (this.tasks[existing] !== undefined)
    {
      this.tasks[alias] = this.tasks[existing];
      gulp.task(alias, this.tasks[existing]);
    }
    else 
    {
      console.warn("No such task", existing);
    }
  }

  watch(name, sources, task)
  {
    return this.add(name, function()
    {
      gulp.watch(sources, gulp.series(task));
    });
  }

} // GulpHelper

module.exports = GulpHelper;
