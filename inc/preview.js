var _ = require('lodash');
var fs = require('fs');
var child_process = require('child_process');
var settings = require('./../config');

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
    standby: 10000,
    interval: 100,
    lastOutput: Date.now(),
    fileName: Date.now(),  // Temporary file's name
    fileExt: '.tex',
    latexCommand: 'cd {{dir}} && pdflatex {{file}}',
    convertCommand: 'cd {{dir}} && convert {{fileName}}.pdf {{fileName}}.png'
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

  // Stuck control
  var timerFunc = function() {
    if ( ! self.completed ) {
      if (Date.now() - self.opts.lastOutput > self.opts.standby) {
        self.latexProcess && self.latexProcess.kill();
        self.convertProcess && self.convertProcess.kill();
        return self.complete(PreviewError('Process couldn\'t complete'));
      }
      setTimeout(timerFunc, self.opts.interval);
    }
  };

  timerFunc();

  // Write input to a temporary file
  fs.writeFile(settings.tmpDir + self.opts.fileName + self.opts.fileExt, source, function(error) {
    // Finish on error
    if (error) {
      return self.complete(PreviewError('Source couldn\'t write to a temporary file'));
    }
    // File created, process continues
    self.opts.lastOutput = Date.now();

    // Compile the temporary tex file
    self.latexProcess = child_process.exec(
      self.opts.latexCommand
        .replace('{{dir}}', settings.tmpDir)
        .replace('{{file}}', self.opts.fileName + self.opts.fileExt),
      function(error, stdout, stderr) {
        // If there was an error,
        // response should have been sent already
        if (self.completed) {
          return;
        }

        if (error !== null) {
          return self.complete(PreviewError("Latex has encountered an error"));
        }

        self.opts.lastOutput = Date.now();

        // Convert pdf file to png
        self.convertProcess = child_process.exec(
          self.opts.convertCommand
            .replace('{{dir}}', settings.tmpDir)
            .replace(/\{\{fileName\}\}/g, self.opts.fileName),
          function(error, stdout, stderr) {
            if (self.completed) {
              return;
            }
            if (error !== null) {
              return self.complete(PreviewError("Error while converting pdf to png"));
            }
            self.opts.lastOutput = Date.now();

            var allFiles = fs.readdirSync(settings.tmpDir);
            var resultData = [];
            allFiles.map(function(fileName) {
              if (RegExp(self.opts.fileName + '(-\\d+)?\\.png$').test(fileName)) {
                // Create base64 data of the created image
                resultData.push(Buffer(fs.readFileSync(settings.tmpDir + fileName)).toString('base64'));
              }
            });

            // Remove all of the created files
            self.clear();

            return self.complete({
              success: true,
              message: "Data URI created successfully",
              result: resultData
            });
          }
        );

        self.convertProcess.stdout.on('data', function(data) {
          lastOutput = Date.now();
        });
      }
    );
    
    self.latexProcess.stdout.on('data', function(data) {
      lastOutput = Date.now();
    });
  });
}

/**
 * Triggers or binds complete callbacks
 * @param  {Mixed}  cbOrRes Callback function or response object
 * @return {Object}         this
 */
Preview.prototype.complete = function(cbOrRes) {
  var self = this;
  if (typeof cbOrRes === 'function') {
    this.completeCallbacks.push(cbOrRes);
  } else {
    self.completed = true;
    for (var i = 0; i < this.completeCallbacks.length; i++) {
      this.completeCallbacks[i].call(self, cbOrRes);
    }
  }
  return self;
}

/**
 * Removes all created files
 * @return {Void}
 */
Preview.prototype.clear = function() {
  var self = this;
  var regex = RegExp(self.opts.fileName + '(-\\d+)?\\.(png|aux|log|pdf|tex)');
  // Clear tmpDir
  fs.readdir(settings.tmpDir, function(err, files) {
    if ( ! err ) {
      for (var i = 0; i < files.length; i++) {
        if (regex.test(files[i])) {
          fs.unlink(settings.tmpDir + files[i]);
        }
      }
    }
  });
}

/**
 * Preview exception
 * @param {String} message
 */
function PreviewError(message) {
  if ( ! (this instanceof PreviewError) ) {
    return new PreviewError(message);
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

module.exports = Preview;