var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject;
var clean = require('gulp-clean');
var es = require('event-stream');
const zip = require('gulp-zip');

var targetpaths = {};

gulp.task('firefox-scripts', function () {
    var tsResult = tsProject.src()
        .pipe(tsProject());

    return tsResult.js.pipe(gulp.dest(targetpaths.target));
});

gulp.task('chrome-scripts', function () {
    var tsResult = tsProject.src()
        .pipe(tsProject());

    return tsResult.js.pipe(gulp.dest(targetpaths.target));
});

gulp.task('firefox-setpaths', function() {
  tsProject = ts.createProject('firefox/tsconfig.json');
  targetpaths.target = 'release/firefox';
  targetpaths.icons = targetpaths.target + '/icons'
  targetpaths.html = targetpaths.target + '/html'
});

gulp.task('chrome-setpaths', function() {
    tsProject = ts.createProject('chrome/tsconfig.json');
    targetpaths.target = 'release/chrome';
    targetpaths.icons = targetpaths.target + '/icons'
    targetpaths.html = targetpaths.target + '/html'
});

gulp.task('copy-icons', function() {
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
    'chrome-scripts',
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
    'firefox-scripts',
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

gulp.task('firefox-watch', [
    'firefox-setpaths',
    'firefox-scripts',
    ], function () {

        gulp.watch('scripts/*.ts', ['firefox-scripts'])
        gulp.watch('html/*', ['copy-html'])

})

gulp.task('chrome-watch', [
    'chrome-setpaths',
    'chrome-scripts',
    ], function () {

        gulp.watch('scripts/*.ts', ['chrome-scripts'])
        gulp.watch('html/*', ['copy-html'])

})

gulp.task('chrome-package', [
    'chrome'
    ], function() {
        return gulp.src(targetpaths.target + '/**/*')
            .pipe(zip('imoin.zip'))
            .pipe(gulp.dest(targetpaths.target + '/artifacts/'));
    });

gulp.task('clean-firefox', ['firefox-setpaths'], function() {
    return gulp.src(targetpaths.target, {read: false})
    .pipe(clean());
})

gulp.task('clean-chrome', ['chrome-setpaths'], function() {
    return gulp.src(targetpaths.target, {read: false})
    .pipe(clean());
})

gulp.task('clean', ['clean-firefox', 'clean-chrome'], function() {
    
})