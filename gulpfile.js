var gulp = require('gulp'),
gulp = require('gulp'),
htmlmin = require('gulp-htmlmin'),
fs = require('fs'),
uglify = require('gulp-uglify'),
clean = require('gulp-clean'),
runSequence = require('run-sequence'),
livereload = require('gulp-livereload'),
server = require('gulp-server-livereload'),
sass = require('gulp-sass'),
inject = require('gulp-inject'),
webserver = require('gulp-webserver'),
htmlclean = require('gulp-htmlclean'),
cleanCSS = require('gulp-clean-css'),
concat = require('gulp-concat'),
uglify = require('gulp-uglify'),
del = require('del'),
replace = require('gulp-replace'),
concat = require('gulp-concat');

var paths = {
	src: 'src/**/*',
	srcHTML: 'src/**/*.html',
	srcCSS: 'src/**/*.css',
	srcSASS:'src/sass/**/*.scss',
	srcJS: 'src/**/*.js',
	tmp: 'tmp',
	tmpIndex: 'tmp/index.html',
	tmpCSS: 'tmp/**/*.css',
	tmpJS: 'tmp/**/*.js',
	dist: 'dist',
	distIndex: 'dist/index.html',
	distCSS: 'dist/**/*.css',
	distJS: 'dist/**/*.js'
};

gulp.task('html', function () {
	return gulp.src(paths.srcHTML).pipe(gulp.dest(paths.tmp));
});

gulp.task('css',['sass'], function () {
	return gulp.src(paths.srcCSS).pipe(gulp.dest(paths.tmp));
});

gulp.task('js', function () {
	return gulp.src(paths.srcJS).pipe(gulp.dest(paths.tmp));
});

gulp.task('copy', ['html', 'css', 'js']);

gulp.task('inject', ['copy'], function () {
	var css = gulp.src(paths.tmpCSS);
	var js = gulp.src(paths.tmpJS);
	return gulp.src(paths.tmpIndex)
	.pipe(inject( css, { relative:true } ))
	.pipe(inject( js, { relative:true } ))
	.pipe(gulp.dest(paths.tmp));
});

gulp.task('serve', ['inject'], function () {
	return gulp.src(paths.tmp)
	.pipe(webserver({
		port: 3000,
		livereload: true,
		open: true
	}));
});

gulp.task('watch', ['serve'], function () {
	gulp.watch(paths.src, ['inject']);
});

gulp.task('default', ['watch']);

gulp.task('html:dist', function () {
	return gulp.src(paths.srcHTML)
	.pipe(htmlclean())
	.pipe(htmlmin({collapseWhitespace: true}))
	.pipe(gulp.dest(paths.dist));
});
gulp.task('css:dist',['sass'], function () {
	return gulp.src(paths.srcCSS)
	.pipe(concat('style.min.css'))
	.pipe(cleanCSS())
	.pipe(gulp.dest(paths.dist));
});
gulp.task('js:dist', function () {
	return gulp.src(paths.srcJS)
	.pipe(concat('script.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest(paths.dist));
});

gulp.task('copy:dist', ['html:dist', 'css:dist', 'js:dist']);
gulp.task('inject:dist', ['copy:dist'], function () {
	var js = fs.readFileSync(paths.dist + '/script.min.js', 'utf8');
	var css = fs.readFileSync(paths.dist + '/style.min.css', 'utf8');
	var cssSrc = gulp.src(paths.distCSS);
	var jsSrc = gulp.src(paths.distJS);
	return gulp.src(paths.distIndex)
	.pipe(inject( cssSrc, { relative:true } ))
	.pipe(inject( jsSrc, { relative:true } ))
	.pipe(replace('<script src="script.min.js"></script>', '<script type="text/javascript">' + js +'</script>'))
	.pipe(replace('<link rel="stylesheet" href="style.min.css">', '<style type="text/css">'+ css +'</style>'))
	.pipe(gulp.dest(paths.dist));
});

gulp.task('sass', function () {
	return gulp.src(paths.srcSASS)
	.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
	.pipe(gulp.dest('./src/css/'));
});

gulp.task('build', ['inject:dist']);

gulp.task('clean', function () {
	del([paths.tmp, paths.dist,paths.srcCSS]);
});


