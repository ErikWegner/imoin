var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject;
var clean = require('gulp-clean');
var es = require('event-stream');

var targetpaths = {};

gulp.task('firefox-scripts', function () {
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

gulp.task('copy-icons', function() {
    return gulp.src(['icons/**/*']).pipe(gulp.dest(targetpaths.icons));
})

gulp.task('firefox', [
    'firefox-setpaths', 
    'copy-icons', 
    'firefox-scripts',
    ], function () {
        return es.concat(
            gulp.src(['firefox/html/**/*']).pipe(gulp.dest(targetpaths.html)),
            gulp.src([
                'firefox/manifest.json',
                'vendor/require.js'
                ]).pipe(gulp.dest(targetpaths.target)),
        )
        
})

gulp.task('clean-firefox', ['firefox-setpaths'], function() {
    return gulp.src(targetpaths.target, {read: false})
    .pipe(clean());
})

gulp.task('clean', ['clean-firefox'], function() {
    
})