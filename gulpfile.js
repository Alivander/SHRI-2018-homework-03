"use strict";

var gulp = require("gulp");
var run = require("run-sequence");
var rename = require("gulp-rename");
var del = require("del");

var htmlmin = require("gulp-htmlmin");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");

var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var csso = require('gulp-csso');

var jsmin = require("gulp-uglyfly");

var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");

var plumber = require("gulp-plumber");
var server = require("browser-sync").create();

gulp.task("html", function() {
  return gulp.src("source/*.html")
    .pipe(plumber())
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("build/"))
    .pipe(server.stream());
});

gulp.task("style", function() {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("script", function () {
  return gulp.src("source/js/**/*.js")
    .pipe(plumber())
    .pipe(gulp.dest("build/js"))
    // .pipe(jsmin())
    // .pipe(rename({suffix: ".min"}))
    // .pipe(gulp.dest("build/js"))
    .pipe(server.stream());
});

gulp.task("images", function () {
  return gulp.src("source/img/**/*")
    .pipe(plumber())
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"))
    .pipe(server.stream());
});

gulp.task("serve", function() {
  server.init({
    server: "build/"
  });

  gulp.watch("source/*.html", ["html"]);
  gulp.watch("source/sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("source/js/**/*.js", ["script"]);
  gulp.watch("source/img/**/*", ["images", "webp"]);
  gulp.watch("source/fonts/*.{woff,woff2}", ["fonts"]);
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("build", function (done) {
  run(
      "clean",
      "style",
      "images",
      "html",
      "script",
      done
  );
});
