var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var rename = require("gulp-rename");

var files = {
	css: {
		vendor: [
			'bower_components/bootstrap/dist/css/bootstrap.min.css',
			'bower_components/font-awesome/css/font-awesome.min.css',
			'assets/vendor/hljs.css',
			'node_modules/codemirror/lib/codemirror.css',
			'node_modules/codemirror/addon/fold/foldgutter.css',
			'node_modules/codemirror/addon/dialog/dialog.css',
			'node_modules/react-select2-wrapper/css/select2.css'
		],
		custom: ['assets/css/*.css'],
		sassFile: ['assets/styles/*.scss']
	},
	js: {
		vendor: [
			'bower_components/jquery/dist/jquery.min.js',
			'bower_components/bootstrap/dist/js/bootstrap.min.js',
			'bower_components/lodash/dist/lodash.min.js',
			'bower_components/crypto-js/crypto-js.js',
			'bower_components/lzma/src/lzma.js',
			'bower_components/urlsafe-base64/app.js',
			'bower_components/auth0.js/build/auth0.min.js'
		],
		custom: [
		]
	}
};

function bundle_stuff(src, filename, distPath) {
	return gulp.src(src)
		.pipe(concat(filename))
		.pipe(gulp.dest(distPath));
}

gulp.task('vendorcss', function() {
	return bundle_stuff(files.css.vendor, 'vendor.min.css', 'dist/css');
});

gulp.task('customcss', ['sass'], function() {
	return gulp.src(files.css.custom)
		.pipe(minifyCSS())
		.pipe(concat('style.min.css'))
		.pipe(gulp.dest('dist/css'));
});

gulp.task('vendorjs', function() {
	return bundle_stuff(files.js.vendor, 'vendor.min.js', 'dist/js');
});

gulp.task('sass', function() {
	return gulp.src(files.css.sassFile)
		.pipe(sass.sync().on('error', sass.logError))
		.pipe(gulp.dest('assets/css'));
});

gulp.task('moveCss', function() {
	return gulp.src(['bower_components/bootstrap/dist/css/bootstrap.min.css.map'])
		.pipe(gulp.dest('dist/css'));
});

gulp.task('moveFonts', function() {
	return gulp.src(['bower_components/bootstrap/dist/fonts/*', 
		'bower_components/font-awesome/fonts/*'
		])
		.pipe(gulp.dest('dist/fonts'));
});

// Include dependency in dist
gulp.task('move_js_depends', function() {
	return gulp.src(['bower_components/lzma/src/lzma_worker.js',
		'assets/vendor/JSONURL.js'])
		.pipe(gulp.dest('dist/vendor'));
});

function move_after_build(path) {
	var dirs = [
		'app',
		'assets',
		'dist'
	];
	dirs.forEach(function(dir) {
		gulp.src([dir+'/**/*']).pipe(gulp.dest(path+dir+'/'));
	});
	return gulp.src(['index.html']).pipe(gulp.dest(path));
}

// Prepare files for es plugin
gulp.task('build_es_plugin', ['compact'], function() {
	return move_after_build('./_site/');
});

// chrome build
gulp.task('chromePreBuild', ['compact', 'chrome-specific_dir'], function() {
});

gulp.task('chromeBuild', ['chromePreBuild'], function() {
	return move_after_build('./gem-unpacked/site/');
});

// copy chrome-specific dir
gulp.task('chrome-specific_dir', function() {
	return gulp.src(['chrome-specific/**/*']).pipe(gulp.dest('./gem-unpacked/'));
});

gulp.task('compact', [
	'customcss', 
	'vendorcss', 
	'vendorjs', 
	'moveCss', 
	'moveFonts',
	'move_js_depends'
]);

gulp.task('watchfiles', function() {
	gulp.watch(files.css.sassFile, ['customcss']);
});

gulp.task('default', ['compact']);

gulp.task('watch', ['compact', 'watchfiles']);
