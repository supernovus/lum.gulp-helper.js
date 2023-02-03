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

## Future Plans

### 2.x Rewrite (2022-08-30)

As I'm changing all of my old JS libraries into new `npm` modules which will
overhaul how I work with JS in web apps entirely, version `2.0` of this will
likely be a fairly big rewrite, and will move the package from `lum-gulp-helper`
to the `@lumjs/gulp-helper` namespace.

### Update (2023-02-03)

I'm not currently sure if there is a future to this library.

While I'm likely going to continue to use Gulp in some regard
for my custom projects, there's no one-single path I'm using anymore,
and with the new `@lumjs` libraries using Webpack instead of Gulp for their
Javascript at the very least (I have not seen how well the multiple entry
points and code-splitting works with CSS yet, so whether that moves to 
Webpack or continues to use Gulp with the `gulp-sass` stream plugin is yet 
to be seen.)

Once I have finished porting all of the old `Lum.js` libraries into the
`@lumjs` collection, I will start porting all of my personal and work web apps
to the new libraries, and at that point will start to figure out if there's
a place in the ecosystem for this library or not. 

If I determine there is, I'll do the `2.x` rewrite I described above, although
instead of a single helper library, I'll break it down into a collection of
smaller components, so the different features can be mixed and matched for
each specific web app's requirements.

If I decide it's no longer needed, I will simply archive this repo.

## Official URLs

This library can be found in two places:

 * [Github](https://github.com/supernovus/lum.gulp-helper.js)
 * [NPM](https://www.npmjs.com/package/lum-gulp-helper)

## Author

Timothy Totten <2010@totten.ca>

## License

[MIT](https://spdx.org/licenses/MIT.html)
