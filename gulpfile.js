var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('firefox/tsconfig.json');

gulp.task('firefox-scripts', function() {
        var tsResult = tsProject.src() 
            .pipe(tsProject());
 
    return tsResult.js.pipe(gulp.dest('firefox'));
});