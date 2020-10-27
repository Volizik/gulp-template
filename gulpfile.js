// TODO: install gulp-cli globally

const { dest, src, series, parallel, watch } = require('gulp');
const sass = require("gulp-sass");
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const htmlExtender = require('gulp-html-extend');
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const del = require('del');
const image = require('gulp-image');

function javascript() {
    return src('src/js/*.js')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(plumber.stop())
        .pipe(dest('./dist/js'))
        .pipe(browserSync.stream());
}

function html() {
    return src('./src/html/*.html')
        .pipe(htmlExtender({ annotations: true, verbose: false }))
        .pipe(dest('./dist'))
        .pipe(browserSync.stream())
}

function styles() {
    return (
        src("./src/scss/styles.scss")
            .pipe(plumber())
            .pipe(sourcemaps.init())
            .pipe(sass({outputStyle: 'compressed'}))
            .pipe(autoprefixer())
            .on("error", sass.logError)
            .pipe(sourcemaps.write())
            .pipe(plumber.stop())
            .pipe(dest("./dist/css"))
            .pipe(browserSync.stream())
    );
}

function images() {
    return (
        src('./src/images/**/*')
            .pipe(image())
            .pipe(dest('./dist/images'))
            .pipe(browserSync.stream())
    )
}

function watchFiles() {
    browserSync.init({
        server: {
            baseDir: "./dist",
            index: '/index.html'
        }
    });


    watch('./src/scss/**/*.scss', styles);
    watch('./src/html/**/*.html', html);
    watch('./src/js/**/*.js', javascript);
}

async function clean() {
    await del(['./dist']);
}

exports.default = series(clean, parallel(styles, html, javascript), watchFiles);
exports.build = series(clean, parallel(styles, html, javascript));
