'use strict';
import gulp from 'gulp';
import { deleteAsync } from 'del';
import bump from 'gulp-bump';
import fs from 'fs';
import semver from 'semver';
import gulpEsbuild from 'gulp-esbuild';

const { src, dest } = gulp;

let entryTSFile = '';
let outputFile = '';
let targetpaths = { otherfiles: [] };

// ts-script
function compileTS() {
  return src(entryTSFile)
    .pipe(
      gulpEsbuild({
        outfile: outputFile,
        bundle: true,
        loader: {
          '.tsx': 'tsx',
        },
      }),
    )
    .pipe(dest('dist'));
}

function copyTS() {
  return gulp
    .src(['dist/scripts/**/*.js'])
    .pipe(gulp.dest(targetpaths.target + '/'));
}

// firefox-setpaths
function prepareFirefox(cb) {
  entryTSFile = 'scripts/firefox.ts';
  outputFile = 'firefox.js';
  targetpaths.target = 'release/firefox';
  targetpaths.icons = targetpaths.target + '/icons';
  targetpaths.html = targetpaths.target + '/html';
  targetpaths.manifest = 'firefox/manifest.json';
  targetpaths.otherfiles = ['firefox/background-page.html'];
  cb();
}

// chrome-setpaths
function prepareChrome(cb) {
  entryTSFile = 'scripts/chrome.ts';
  outputFile = 'chrome.js';
  targetpaths.target = 'release/chrome';
  targetpaths.icons = targetpaths.target + '/icons';
  targetpaths.html = targetpaths.target + '/html';
  targetpaths.manifest = 'chrome/manifest.json';
  cb();
}

// copy-icons
function copyIcons() {
  return gulp.src(['icons/**/*']).pipe(gulp.dest(targetpaths.icons));
}

// copy-html
function copyHtml() {
  return gulp.src(['html/**/*']).pipe(gulp.dest(targetpaths.html));
}

function copyManifest() {
  return gulp
    .src([targetpaths.manifest, ...targetpaths.otherfiles])
    .pipe(gulp.dest(targetpaths.target));
}

function copyChromeJs() {
  return gulp.src('dist/chrome.js').pipe(gulp.dest(targetpaths.target));
}

export const firefox = gulp.series(
  prepareFirefox,
  gulp.series(copyIcons, copyHtml, compileTS, copyTS, copyManifest),
);

export const chrome = gulp.series(
  prepareChrome,
  gulp.series(
    copyIcons,
    copyHtml,
    compileTS,
    copyTS,
    copyManifest,
    copyChromeJs,
  ),
);

function watchTS() {
  gulp.watch('scripts/*.ts', gulp.series(compileTS, copyTS));
  gulp.watch('html/*', copyHtml);
}

// firefox-watch
export const firefoxWatch = gulp.series(
  prepareFirefox,
  compileTS,
  copyTS,
  watchTS,
);

// chrome-watch
export const chromeWatch = gulp.series(
  prepareChrome,
  compileTS,
  copyTS,
  watchTS,
);

// bump versions on package/manifest
export const bumpPatch = function () {
  // read version from package.json
  var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  // increment version
  var newVer = semver.inc(pkg.version, 'patch');

  return gulp
    .src(
      ['./chrome/manifest.json', './firefox/manifest.json', './package.json'],
      { base: './' },
    )
    .pipe(
      bump({
        version: newVer,
      }),
    )
    .pipe(gulp.dest('./'));
};

// bump versions on package/manifest
export const bumpMinor = function () {
  // read version from package.json
  var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  // increment version
  var newVer = semver.inc(pkg.version, 'minor');

  return gulp
    .src(
      ['./chrome/manifest.json', './firefox/manifest.json', './package.json'],
      { base: './' },
    )
    .pipe(
      bump({
        version: newVer,
      }),
    )
    .pipe(gulp.dest('./'));
};

function cleanTarget() {
  return deleteAsync(['dist', targetpaths.target]);
}

// clean-firefox
export const cleanFirefox = gulp.series(prepareFirefox, cleanTarget);

// clean-chrome
export const cleanChrome = gulp.series(prepareChrome, cleanTarget);

export const clean = gulp.series(cleanFirefox, cleanChrome);
