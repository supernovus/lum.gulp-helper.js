# Lum Gulp Helper

## Summary

Just a helper library for own project gulpfiles.
May or may not be useful for anyone else.

Supports both monolithic `gulpfile.js`, or modular `gulpfile.js/index.js`
style files. Will continue to grow as my libraries are split up further.

## Description

Most of my libraries and apps that use gulpfiles have a few very common
types of tasks/rules, and I figured if they're almost always the same,
why continue to duplicate the functionality in multiple places.

So this library simply acts as a wrapper around `gulp` and a few of the
common plugins and tasks I use such as `del`, `gulp-terser`, `gulp-sass`,
`gulp-sourcemaps`, `gulp-concat`, `gulp-file-cache`, etc.

It also has optional support for `gulp-babel`, but I'm currently not using
any transcoding in my own apps as every *supported* browser supports modern
Javascript/ECMAScript, so I'm not too worried about it.

## Official URLs

This library can be found in two places:

 * [Github](https://github.com/supernovus/lum.gulp-helper.js)
 * [NPM](https://www.npmjs.com/package/lum-gulp-helper)

## Author

Timothy Totten <2010@totten.ca>

## License

[MIT](https://spdx.org/licenses/MIT.html)
