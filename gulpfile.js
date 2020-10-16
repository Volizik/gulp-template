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

function javascript() {
    return src('src/js/*.js')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(plumber.stop())
        .pipe(dest('./dist/js'));
}

function html() {
    return src('./src/html/*.html')
        .pipe(htmlExtender({ annotations: true, verbose: false }))
        .pipe(dest('./dist'))
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
    );
}

function watchFiles() {
    clean();
    styles();
    javascript();
    html();

    browserSync.init({
        server: {
            baseDir: "./dist",
            index: '/index.html'
        }
    });


    watch('./src/scss/**/*.scss').on('change', () => {
        styles();
        browserSync.reload();
    });
    watch('./src/html/**/*.html').on('change', () => {
        html();
        browserSync.reload();
    });
    watch('./src/js/**/*.js').on('change', () => {
        javascript();
        browserSync.reload();
    });
}

function clean() {
    del.sync(['./dist']);
}

exports.default = watchFiles;
exports.build = series(clean, parallel(styles, html, javascript));
