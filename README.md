# Lum Gulp Helper

## Summary

Just a helper library for own project gulpfiles.
May or may not be useful for anyone else.

Supports both monolithic `gulpfile.js`, or modular `gulpfile.js/index.js`
style files. Will continue to grow as my libraries are split up further.

## Description

Many of my libraries and apps that use gulpfiles have a few very common
types of tasks/rules, and I figured if they're almost always the same,
why continue to duplicate the functionality in multiple places.

So this library simply acts as a wrapper around `gulp` and a few of the
common plugins and tasks I use such as `del`, `gulp-terser`, `gulp-sass`,
`gulp-sourcemaps`, `gulp-concat`, `gulp-file-cache`, etc.

It also has optional support for `gulp-babel`, but I'm currently not using
any transcoding in my own apps as every *supported* browser supports modern
Javascript/ECMAScript, so I'm not too worried about it.

## Package Versions

This package was originally published *before* I had introduced the `@lumjs`
namespace for my `npm` packages, and used the `lum-gulp-helper` package name
for the `1.x` branch.

For the `2.x` branch, this has moved to the `@lumjs/gulp-helper` package name,
and the [@lumjs/core] package is used, replacing any placeholder functions I'd
used with proper library imports.

## Future Plans

I am thinking at some point I will split the library up into standalone
modules that can be used independently of each other, as well as offering
some kind of integration with my [@lumjs/webpack-helper] library 
to make Gulp and Webpack work together in cases where both may be required.

## Official URLs

This library can be found in three places:

 * [Github](https://github.com/supernovus/lum.gulp-helper.js)
 * [NPM, new package](https://www.npmjs.com/package/@lumjs/gulp-helper)
 * [NPM, old package](https://www.npmjs.com/package/lum-gulp-helper)

## Author

Timothy Totten <2010@totten.ca>

## License

[MIT](https://spdx.org/licenses/MIT.html)

[@lumjs/core]: https://github.com/supernovus/lum.core.js
[@lumjs/webpack-helper]: https://github.com/supernovus/lum.webpack-helper.js

