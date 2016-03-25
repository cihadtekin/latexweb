var app = require('express')();
var _ = require('lodash');
var fs = require('fs');
var child_process = require('child_process');
var tmpDir = __dirname + '/tmp/';

if ( ! fs.existsSync(tmpDir) ){
  fs.mkdirSync(tmpDir);
}

// Clear tmpDir
fs.readdir(tmpDir, function(err, files) {
  if ( ! err ) {
    for (var i = 0; i < files.length; i++) {
      fs.unlink(tmpDir + files[i]);
    }
  }
});

function Preview(source, opts) {
  if ( ! (this instanceof Preview) ) {
    return new Preview(source, opts);
  }
  var self = this;
  /**
   * All options
   * @type {Object}
   */
  self.opts = _.defaults(opts, {
    standby: 1000,
    interval: 50,
    lastOutput: Date.now(),
    fileName: Date.now(),  // Temporary file's name
    fileExt: '.tex',
    latexCommand: 'cd {{dir}} && pdflatex {{file}}',
    convertCommand: 'cd {{dir}} && convert -density 600x600 {{fileName}}.pdf -quality 90 -resize 1080x800 {{fileName}}.png'
  });
  /**
   * Source to compile
   * @type {String}
   */
  self.source = source;
  /**
   * child_process object for latex
   * @type {Object}
   */
  self.latexProcess = null;
  /**
   * child_process object for convert program
   * (imagemagick)
   * @type {Object}
   */
  self.convertProcess = null;
  /**
   * @type {Array}
   */
  self.completeCallbacks = [];
  /**
   * @type {Boolean}
   */
  self.completed = false;
  /**
   * Stuck control
   * @type {Number}
   */
  self.intervalID = setInterval(function() {
    if (self.completed) {
      clearInterval(self.intervalID);
    }
    if (Date.now() - self.opts.lastOutput > self.opts.standby) {
      self.latexProcess && self.latexProcess.kill();
      return self.complete(PreviewError('Process couldn\'t complete'));
    }
  }, self.opts.interval);

  // Write input to a temporary file
  fs.writeFile(tmpDir + self.opts.fileName + self.opts.fileExt, source, function(error) {
    // Finish on error
    if (error) {
      return self.complete(PreviewError('Source couldn\'t write to a temporary file'));
    }
    // File created, process continues
    self.opts.lastOutput = Date.now();

    // Compile the temporary tex file
    self.latexProcess = child_process.exec(
      self.opts.latexCommand
        .replace('{{dir}}', tmpDir)
        .replace('{{file}}', self.opts.fileName + self.opts.fileExt),
      function(error, stdout, stderr) {
        if (error !== null) {
          return self.complete(PreviewError("Latex has encountered an error"));
        }

        // Convert pdf file to png
        self.convertProcess = child_process.exec(
          self.opts.convertCommand
            .replace('{{dir}}', tmpDir)
            .replace(/\{\{fileName\}\}/g, self.opts.fileName),
          function(error, stdout, stderr) {
            if (error !== null) {
              return self.complete(PreviewError("Error while converting pdf to png"));
            }

            // Create base64 data of the created image
            fs.readFile(tmpDir + self.opts.fileName + '.png', function(error, data) {
              if (error !== null) {
                return self.complete(PreviewError("Error while reading created image file"));
              }

              return self.complete({
                success: true,
                message: "Data URI created successfully",
                result: new Buffer(data).toString('base64')
              });
            });
          }
        );
      }
    );
    // Listen outputs
    self.latexProcess.stdout.on('data', function(data) {
      lastOutput = Date.now();
    });
  });
}

/**
 * Triggers or binds complete callbacks
 * @param  {Mixed}  cbOrRes Callback fnction or response object
 * @return {Object}         this
 */
Preview.prototype.complete = function(cbOrRes) {
  var self = this;
  if (typeof cbOrRes === 'function') {
    this.completeCallbacks.push(cbOrRes);
  } else {
    self.completed = true;
    self.intervalID && clearInterval(self.intervalID);
    for (var i = 0; i < this.completeCallbacks.length; i++) {
      this.completeCallbacks[i].call(self, cbOrRes);
    }
  }
  return self;
}

/**
 * Preview exception
 * @param {String} message
 */
function PreviewError(message) {
  if ( ! (this instanceof PreviewError) ) {
    return new PreviewError;
  }
  /**
   * Message
   * @type {String}
   */
  this.message = message;
  /**
   * Success
   * @type {Boolean}
   */
  this.success = false;
}

app.post('/', function(req, res) {
  res.header("Access-Control-Allow-Origin", "http://localhost");
  res.header("Access-Control-Allow-Methods", "POST");

  Preview(
    "\\documentclass[preview,border=12pt,12pt]{standalone}" + "\n" +
    "\\usepackage{amsmath}" + "\n" +
    "\\usepackage{graphicx}" + "\n" +
    "\\usepackage{verbatim}" + "\n" +
    "\\usepackage{color}" + "\n" +
    "\\usepackage{subfigure}" + "\n" +
    "\\usepackage{hyperref}" + "\n" +
    "\\setlength{\\baselineskip}{16.0pt}" + "\n" +
    "\\setlength{\\parskip}{3pt plus 2pt}" + "\n" +
    "\\setlength{\\parindent}{20pt}" + "\n" +
    "\\setlength{\\oddsidemargin}{0.5cm}" + "\n" +
    "\\setlength{\\evensidemargin}{0.5cm}" + "\n" +
    "\\setlength{\\marginparsep}{0.75cm}" + "\n" +
    "\\setlength{\\marginparwidth}{2.5cm}" + "\n" +
    "\\setlength{\\marginparpush}{1.0cm}" + "\n" +
    "\\setlength{\\textwidth}{150mm}" + "\n" +
    "\\begin{comment}" + "\n" +
    "\\pagestyle{empty}" + "\n" +
    "\\end{comment}" + "\n" +
    "\\begin{document}" + "\n" +
    "\\begin{center}" + "\n" +
    "{\\large Introduction to \\LaTeX}" + "\n" +
    "\\copyright 2006 by Harvey Gould" + "\n" +
    "December 5, 2006" + "\n" +
    "\\end{center}" + "\n" +
    "\\section{Introduction}" + "\n" +
    "\\TeX\\ looks more difficult than it is. It is" + "\n" +
    "almost as easy as $\\pi$. See how easy it is to make special" + "\n" +
    "symbols such as $\\alpha$," + "\n" +
    "$\\beta$, $\\gamma$," + "\n" +
    "$\\delta$, $\\sin x$, $\\hbar$, $\\lambda$, $\\ldots$ We also can make" + "\n" +
    "subscripts" + "\n" +
    "{\\small \\noindent Updated 5 December 2006.}" + "\n" +
    "\\end{document}"
  ).complete(function(result) {
    console.log('asdf');
    // res.json(result);
  });

});

app.listen(3000, function() {
  console.log('Listening on 3000');
});