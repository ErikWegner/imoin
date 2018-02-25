"use strict";
const gulp = require('gulp');
const webpack = require('webpack-stream');
const clean = require('gulp-clean');
const es = require('event-stream');
const zip = require('gulp-zip');
const bump = require('gulp-bump');
const fs = require('fs');
const semver = require('semver');
const path = require('path');

let tsProject;
let targetpaths = {};

gulp.task('ts-scripts', function () {
    const wpconfig = require('./webpack.config.js');
    wpconfig.entry.index = './' + tsProject;
    wpconfig.output.path = path.resolve(__dirname, targetpaths.target);

    return gulp.src(tsProject)
        .pipe(webpack(wpconfig))
        .pipe(gulp.dest(targetpaths.target));
});

gulp.task('firefox-setpaths', function () {
    tsProject = 'scripts/firefox.ts';
    targetpaths.target = 'release/firefox';
    targetpaths.icons = targetpaths.target + '/icons'
    targetpaths.html = targetpaths.target + '/html'
});

gulp.task('chrome-setpaths', function () {
    tsProject = 'scripts/chrome.ts';
    targetpaths.target = 'release/chrome';
    targetpaths.icons = targetpaths.target + '/icons'
    targetpaths.html = targetpaths.target + '/html'
});

gulp.task('edge-setpaths', function () {
    tsProject = 'scripts/edge.ts';
    targetpaths.target = 'release/edge';
    targetpaths.icons = targetpaths.target + '/icons'
    targetpaths.html = targetpaths.target + '/html'
});

gulp.task('opera-setpaths', function () {
    tsProject = 'scripts/opera.ts';
    targetpaths.target = 'release/opera';
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

gulp.task('firefox', [
    'firefox-setpaths',
    'copy-icons',
    'ts-scripts',
    'copy-html',
], function () {
    return es.concat(
        gulp
            .src([
                'firefox/manifest.json'
            ])
            .pipe(gulp.dest(targetpaths.target))
    )
});

gulp.task('chrome', [
    'chrome-setpaths',
    'copy-icons',
    'ts-scripts',
    'copy-html',
], function () {
    return es.concat(
        gulp
            .src([
                'chrome/manifest.json'
            ])
            .pipe(gulp.dest(targetpaths.target))
    )
});

gulp.task('edge', [
    'edge-setpaths',
    'copy-icons',
    'ts-scripts',
    'copy-html',
], function () {
    return es.concat(
        gulp
            .src([
                'edge/manifest.json'
            ])
            .pipe(gulp.dest(targetpaths.target))
    )
});

gulp.task('opera', [
    'opera-setpaths',
    'copy-icons',
    'ts-scripts',
    'copy-html',
], function () {
    return es.concat(
        gulp
            .src([
                'opera/manifest.json'
            ])
            .pipe(gulp.dest(targetpaths.target))
    )
});

gulp.task('firefox-watch', [
    'firefox-setpaths',
    'ts-scripts',
], function () {

    gulp.watch('scripts/*.ts', ['ts-scripts'])
    gulp.watch('html/*', ['copy-html'])

});

gulp.task('chrome-watch', [
    'chrome-setpaths',
    'ts-scripts',
], function () {

    gulp.watch('scripts/*.ts', ['ts-scripts'])
    gulp.watch('html/*', ['copy-html'])

});

gulp.task('edge-watch', [
    'edge-setpaths',
    'ts-scripts',
], function () {

    gulp.watch('scripts/*.ts', ['ts-scripts'])
    gulp.watch('html/*', ['copy-html'])

});

gulp.task('opera-watch', [
    'opera-setpaths',
    'ts-scripts',
], function () {

    gulp.watch('scripts/*.ts', ['ts-scripts'])
    gulp.watch('html/*', ['copy-html'])

});

// bump versions on package/manifest
gulp.task('bump', function () {
    // read version from package.json
    var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));;
    // increment version
    var newVer = semver.inc(pkg.version, 'patch');

    return gulp.src([
        './chrome/manifest.json',
        './firefox/manifest.json',
        './edge/manifest.json',
        './opera/manifest.json',
        './package.json'], { base: './' })
        .pipe(bump({
            version: newVer
        }))
        .pipe(gulp.dest('./'));
});

// bump versions on package/manifest
gulp.task('bump-minor', function () {
    // read version from package.json
    var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));;
    // increment version
    var newVer = semver.inc(pkg.version, 'minor');

    return gulp.src([
        './chrome/manifest.json',
        './firefox/manifest.json',
        './edge/manifest.json',
        './opera/manifest.json',
        './package.json'], { base: './' })
        .pipe(bump({
            version: newVer
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('clean-firefox', ['firefox-setpaths'], function () {
    return gulp.src(targetpaths.target, { read: false })
        .pipe(clean());
});

gulp.task('clean-chrome', ['chrome-setpaths'], function () {
    return gulp.src(targetpaths.target, { read: false })
        .pipe(clean());
});

gulp.task('clean-edge', ['edge-setpaths'], function () {
    return gulp.src(targetpaths.target, { read: false })
        .pipe(clean());
});

gulp.task('clean-opera', ['opera-setpaths'], function () {
    return gulp.src(targetpaths.target, { read: false })
        .pipe(clean());
});

gulp.task('clean', [
    'clean-firefox',
    'clean-chrome',
    'clean-edge',
    'clean-opera',
], function () {

});
