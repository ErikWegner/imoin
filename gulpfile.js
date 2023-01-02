"use strict";
const gulp = require('gulp');
const ts = require("gulp-typescript");
const clean = require('gulp-clean');
const bump = require('gulp-bump');
const fs = require('fs');
const semver = require('semver');
const path = require('path');
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const tsify = require("tsify");

let tsProject;
let targetpaths = {};

// ts-script
function compileTS() {
  return browserify({
    basedir: ".",
    debug: true,
    entries: [tsProject],
    cache: {},
    packageCache: {},
  })
    .plugin(tsify)
    .bundle()
    .pipe(source("bundle.js"))
    .pipe(gulp.dest(targetpaths.target));
}

// firefox-setpaths
function prepareFirefox(cb) {
  tsProject = "scripts/firefox.ts";
  targetpaths.target = "release/firefox";
  targetpaths.icons = targetpaths.target + "/icons";
  targetpaths.html = targetpaths.target + "/html";
  targetpaths.manifest = "firefox/manifest.json";
  cb();
}

// chrome-setpaths
function prepareChrome(cb) {
  tsProject = "scripts/chrome.ts";
  targetpaths.target = "release/chrome";
  targetpaths.icons = targetpaths.target + "/icons";
  targetpaths.html = targetpaths.target + "/html";
  targetpaths.manifest = "chrome/manifest.json";
  cb();
}

// edge-setpaths
function prepareEdge(cb) {
  tsProject = "scripts/edge.ts";
  targetpaths.target = "release/edge";
  targetpaths.icons = targetpaths.target + "/icons";
  targetpaths.html = targetpaths.target + "/html";
  targetpaths.manifest = "edge/manifest.json";
  cb();
}

// opera-setpaths
function prepareOpera(cb) {
  tsProject = "scripts/opera.ts";
  targetpaths.target = "release/opera";
  targetpaths.icons = targetpaths.target + "/icons";
  targetpaths.html = targetpaths.target + "/html";
  targetpaths.manifest = "opera/manifest.json";
  cb();
}

// copy-icons
function copyIcons() {
  return gulp.src(["icons/**/*"]).pipe(gulp.dest(targetpaths.icons));
}

// copy-html
function copyHtml() {
  return gulp.src(["html/**/*"]).pipe(gulp.dest(targetpaths.html));
}

function copyManifest() {
  return gulp.src([targetpaths.manifest]).pipe(gulp.dest(targetpaths.target));
}

exports.firefox = gulp.series(
  prepareFirefox,
  gulp.series(copyIcons, copyHtml, compileTS, copyManifest)
);

exports.chrome = gulp.series(
  prepareChrome,
  gulp.series(copyIcons, copyHtml, compileTS, copyManifest)
);

exports.edge = gulp.series(
  prepareChrome,
  gulp.series(copyIcons, copyHtml, compileTS, copyManifest)
);

exports.opera = gulp.series(
  prepareOpera,
  gulp.series(copyIcons, copyHtml, compileTS, copyManifest)
);

function watchTS() {
  gulp.watch("scripts/*.ts", compileTS);
  gulp.watch("html/*", copyHtml);
}

// firefox-watch
exports.firefoxWatch = gulp.series(prepareFirefox, compileTS, watchTS);

// chrome-watch
exports.chromeWatch = gulp.series(prepareChrome, compileTS, watchTS);

// edge-watch
exports.edgeWatch = gulp.series(prepareEdge, compileTS, watchTS);

// opera-watch
exports.operaWatch = gulp.series(prepareOpera, compileTS, watchTS);

// bump versions on package/manifest
exports.bump = function () {
  // read version from package.json
  var pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));
  // increment version
  var newVer = semver.inc(pkg.version, "patch");

  return gulp
    .src(
      [
        "./chrome/manifest.json",
        "./firefox/manifest.json",
        "./edge/manifest.json",
        "./opera/manifest.json",
        "./package.json",
      ],
      { base: "./" }
    )
    .pipe(
      bump({
        version: newVer,
      })
    )
    .pipe(gulp.dest("./"));
};

// bump versions on package/manifest
exports.bumpMinor = function () {
  // read version from package.json
  var pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));
  // increment version
  var newVer = semver.inc(pkg.version, "minor");

  return gulp
    .src(
      [
        "./chrome/manifest.json",
        "./firefox/manifest.json",
        "./edge/manifest.json",
        "./opera/manifest.json",
        "./package.json",
      ],
      { base: "./" }
    )
    .pipe(
      bump({
        version: newVer,
      })
    )
    .pipe(gulp.dest("./"));
};

function cleanTarget() {
  return gulp
    .src(targetpaths.target, { read: false, allowEmpty: true })
    .pipe(clean());
}

// clean-firefox
const cleanFirefox = gulp.series(prepareFirefox, cleanTarget);
exports.cleanFirefox = cleanFirefox;

// clean-chrome
const cleanChrome = gulp.series(prepareChrome, cleanTarget);
exports.cleanChrome = cleanChrome;

// clean-edge
const cleanEdge = gulp.series(prepareEdge, cleanTarget);
exports.cleanEdge = cleanEdge;

// clean-opera
const cleanOpera = gulp.series(prepareOpera, cleanTarget);
exports.cleanOpera = cleanOpera;

exports.clean = gulp.series(cleanFirefox, cleanChrome, cleanEdge, cleanOpera);
