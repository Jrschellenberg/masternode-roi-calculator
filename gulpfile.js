var watchify = require('watchify');
var browserify = require('browserify');
var babelify = require('babelify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var assign = require('lodash.assign');
var minifyCss = require('gulp-minify-css');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var Server = require('karma').Server;
var child = require('child_process');
var browserSync = require('browser-sync').create();
var watch = require('gulp-watch');
var uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	clean = require("gulp-clean"),
	cleanCss = require("gulp-clean-css");

var sourceRoot = 'src';
var sitePath = sourceRoot + '/site';
var jsPath = sourceRoot + '/js';
var sassPath = sourceRoot + '/sass';
var servePath = 'serve';
const devJsPath = 'src/js/dependencies/';

const devCssServePath = 'serve/stylesheets/';

const concatCSSFiles = [devCssServePath+'bootstrap.min.css', devCssServePath+'animate.min.css', devCssServePath+'base.css', devCssServePath+'mainNav.css',
	devCssServePath+'timeline.css',	devCssServePath+'footer.css',devCssServePath+'classUtilities.css'];

const concatJSFiles = [devJsPath+'jquery-3.2.1.min.js', devJsPath+'parsley.min.js', devJsPath+'googlePieChart.min.js', devJsPath+'fontawesome-all.min.js', devJsPath+'smooth-scroll.min.js',
	devJsPath+'bundle.js'];


var jekyllLogger = (buffer) => {
    buffer.toString()
        .split(/\n/)
        .forEach((message) => gutil.log('Jekyll: ' + message));
};


gulp.task('concatScriptsProd', ['buildJsProd'], () => {
	return gulp.src(concatJSFiles)
		.pipe(concat('bundle.js'))
		.pipe(gulp.dest(servePath+'/js'))
});

gulp.task('concatScripts', ['buildJs'], () => {
	return gulp.src(concatJSFiles)
		.pipe(concat('bundle.js'))
		.pipe(gulp.dest(servePath+'/js'))
});



gulp.task('jekyll', () => {
  var jekyll = child.exec('jekyll build --watch --incremental --drafts --quiet --source ' + sitePath + ' --destination ' + servePath);

  jekyll.stdout.on('data', jekyllLogger);
  jekyll.stderr.on('data', jekyllLogger);
});


gulp.task('buildJekyll', ['buildSass', 'concatScripts'], () => {
  jekyllLogger(child.execSync('jekyll build --source ' + sitePath + ' --destination ' + servePath));
  return process.exit(0);
});

gulp.task('buildJekyllProduction', ['buildSassProd', 'concatScriptsProd'], () => {
	jekyllLogger(child.execSync('jekyll build --source ' + sitePath + ' --destination ' + servePath));
	return process.exit(0);
});

gulp.task('buildSassProd', ['removeOldCssLocation'] );

gulp.task('bundleCss', ['buildSass'], () => {
	return gulp.src(concatCSSFiles)
		.pipe(concat('bundle.css'))
		.pipe(cleanCss())
		.pipe(gulp.dest('serve/stylesheet'));
});

gulp.task('cleanStyleSheets', ['bundleCss'], () => {
	return gulp.src('serve/stylesheets/*')
		.pipe(clean());
});
gulp.task('moveCssBundle', ['cleanStyleSheets'], () => {
	return gulp.src('serve/stylesheet/*')
		.pipe(gulp.dest('serve/stylesheets/'));
});

gulp.task('removeOldCssLocation', ['moveCssBundle'], () => {
	return gulp.src('serve/stylesheet/**')
		.pipe(clean({force:true}));
});

gulp.task('cleanServe', () => {
	return gulp.src('serve/*')
		.pipe(clean());
});

gulp.task('serve', () => {
  browserSync.init({
      files: [servePath + '/**'],
      port: 4000,
      server: {
          baseDir: servePath
      },
      reloadDebounce: 2000,
      reloadDelay: 1000
  });

  watch(sassPath + '/*.scss')
      .pipe(sourcemaps.init())
      .pipe(sass({
          errLogToConsole: true,
          outputStyle: 'expanded'
      }).on('error', sass.logError))
      .pipe(sourcemaps.write())
      .pipe(postcss([autoprefixer({ browsers: ['last 2 version'] })]))
      .pipe(minifyCss({ compatibility: 'ie8' }))
      .pipe(gulp.dest(servePath + '/stylesheets'));
});

gulp.task('buildSass', function () {
    return gulp
        .src(sassPath + '/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(postcss([autoprefixer({ browsers: ['last 2 version'] })]))
        .pipe(minifyCss({ compatibility: 'ie8' }))
        .pipe(gulp.dest(servePath + '/stylesheets'));
});

gulp.task('default', ['buildSass', 'js', 'jekyll', 'serve']);
gulp.task('build', ['buildJekyll']);

gulp.task('buildProd', ['buildJekyllProduction']);

/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

// add custom browserify options here
var customOpts = {
    entries: [jsPath + '/app.js'],
    debug: true
};
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts)).transform(babelify, { presets: ['es2015'] });

gulp.task('buildJs', bundle); // so you can run `gulp js` to build the file

gulp.task('buildJsProd', bundleProd);

gulp.task('js', () => {
    b.on('update', bundle); // on any dep update, runs the bundler
    b.on('log', gutil.log); // output build logs to terminal
    bundle();
});

function bundle() {
    if (!b) return console.log('Sorry, something went wrong');
    return b.bundle()
        // log errors if they happe
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('bundle.js'))
        // optional, remove if you don't need to buffer file contents
        .pipe(buffer())
        // optional, remove if you dont want sourcemaps
        .pipe(sourcemaps.init({ loadMaps: true })) // loads map from browserify file
        .pipe(sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest(devJsPath));
}

function bundleProd() {
	if (!b) return console.log('Sorry, something went wrong');
	return b.bundle()
	// log errors if they happe
		.on('error', gutil.log.bind(gutil, 'Browserify Error'))
		.pipe(source('bundle.js'))
		// optional, remove if you don't need to buffer file contents
		.pipe(buffer())
    .pipe(uglify())
		.pipe(gulp.dest(devJsPath));
}