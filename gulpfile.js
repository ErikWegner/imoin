"use strict";
const gulp = require('gulp');
const ts = require('gulp-typescript');
const clean = require('gulp-clean');
const es = require('event-stream');
const zip = require('gulp-zip');
const bump = require('gulp-bump');
const fs = require('fs');
const semver = require('semver');

let tsProject;
let targetpaths = {};

gulp.task('ts-scripts', function () {
    let tsResult = tsProject.src()
        .pipe(tsProject());

    return tsResult.js.pipe(gulp.dest(targetpaths.target));
});

gulp.task('firefox-setpaths', function () {
    tsProject = ts.createProject('firefox/tsconfig.json');
    targetpaths.target = 'release/firefox';
    targetpaths.icons = targetpaths.target + '/icons'
    targetpaths.html = targetpaths.target + '/html'
});

gulp.task('chrome-setpaths', function () {
    tsProject = ts.createProject('chrome/tsconfig.json');
    targetpaths.target = 'release/chrome';
    targetpaths.icons = targetpaths.target + '/icons'
    targetpaths.html = targetpaths.target + '/html'
});

gulp.task('electron-setpaths', function () {
    tsProject = ts.createProject('electron/tsconfig.json');
    targetpaths.target = 'release/electron';
    targetpaths.icons = targetpaths.target + '/icons'
    targetpaths.html = targetpaths.target + '/html'
});

gulp.task('copy-icons', function () {
    return gulp.src(['icons/**/*']).pipe(gulp.dest(targetpaths.icons));
})

gulp.task('copy-html', function () {
    return gulp
        .src(['html/**/*'])
        .pipe(gulp.dest(targetpaths.html))
})

gulp.task('chrome', [
    'chrome-setpaths',
    'copy-icons',
    'ts-scripts',
    'copy-html',
], function () {
    return es.concat(
        gulp
            .src([
                'chrome/manifest.json',
                'chrome/manifest.json',
                'vendor/require.js'
            ])
            .pipe(gulp.dest(targetpaths.target))
    )
})

gulp.task('firefox', [
    'firefox-setpaths',
    'copy-icons',
    'ts-scripts',
    'copy-html',
], function () {
    return es.concat(
        gulp
            .src([
                'firefox/manifest.json',
                'vendor/require.js'
            ])
            .pipe(gulp.dest(targetpaths.target))
    )

})


gulp.task('electron', [
    'electron-setpaths',
    'copy-icons',
    'ts-scripts',
    'copy-html',
], function () {
    return es.concat(
        gulp
            .src([
                'electron/package.json'
            ])
            .pipe(gulp.dest(targetpaths.target))
    )

})

gulp.task('firefox-watch', [
    'firefox-setpaths',
    'ts-scripts',
], function () {

    gulp.watch('scripts/*.ts', ['ts-scripts'])
    gulp.watch('html/*', ['copy-html'])

})

gulp.task('chrome-watch', [
    'chrome-setpaths',
    'ts-scripts',
], function () {

    gulp.watch('scripts/*.ts', ['ts-scripts'])
    gulp.watch('html/*', ['copy-html'])

})

gulp.task('electron-watch', [
    'electron-setpaths',
    'ts-scripts',
], function () {

    gulp.watch('scripts/*.ts', ['ts-scripts'])
    gulp.watch('html/*', ['copy-html'])

})

gulp.task('chrome-package', [
    'chrome'
], function () {
    return gulp.src(targetpaths.target + '/**/*')
        .pipe(zip('imoin.zip'))
        .pipe(gulp.dest(targetpaths.target + '/artifacts/'));
});

// bump versions on package/bower/manifest
gulp.task('bump', function () {
    // read version from package.json
    var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));;
    // increment version
    var newVer = semver.inc(pkg.version, 'patch');

    return gulp.src([
        './chrome/manifest.json', 
        './firefox/manifest.json', 
        './electron/package.json', 
        './package.json'], {base: './'})
        .pipe(bump({
            version: newVer
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('clean-firefox', ['firefox-setpaths'], function () {
    return gulp.src(targetpaths.target, { read: false })
        .pipe(clean());
})

gulp.task('clean-chrome', ['chrome-setpaths'], function () {
    return gulp.src(targetpaths.target, { read: false })
        .pipe(clean());
})

gulp.task('clean-electron', ['electron-setpaths'], function () {
    return gulp.src(targetpaths.target, { read: false })
        .pipe(clean());
})

gulp.task('clean', [
    'clean-firefox',
    'clean-chrome',
    'clean-electron'
], function () {

})