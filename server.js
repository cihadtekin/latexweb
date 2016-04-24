/**
 * Latexweb backend script
 * https://github.com/cihadtekin/latexweb
 * 
 * Copyright 2016 Cihad Tekin <cihadtekin@gmail.com>
 * Licensed under MIT
 */
var app = require('express')();
var bodyParser = require('body-parser');
var fs = require('fs');
var child_process = require('child_process');
var settings = require('./config');
var Preview = require('./inc/preview');
var ResultPDF = require('./inc/resultpdf');

if ( ! fs.existsSync(settings.tmpDir) ){
  fs.mkdirSync(settings.tmpDir);
}

// Clear tmpDir
fs.readdir(settings.tmpDir, function(err, files) {
  if ( ! err ) {
    for (var i = 0; i < files.length; i++) {
      fs.unlink(settings.tmpDir + files[i]);
    }
  }
});

app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/preview', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST");

  if (req.body && req.body.source) {
    Preview(req.body.source).complete(function(result) {
      if ( ! result.success ) {
        return res.status(500).json(result);
      } else {
        return res.json(result);
      }
    });
  } else {
    return res.status(500).json({
      "success": false,
      "message": "Source couldn't receive"
    });
  }
});

app.post('/result-pdf', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST");

  if (req.body && req.body.source) {
    ResultPDF(req.body.source).complete(function(result) {
      var self = this;
      if ( ! result.success ) {
        return res.status(500).json(result);
      } else {
        res.sendFile(result.file);
        // Clear files after file sent
        setTimeout(function() {
          self.clear()
        }, 1000);
        return;
      }
    });
  } else {
    return res.status(500).json({
      "success": false,
      "message": "Source couldn't receive"
    });
  }
});

app.listen(3000, function() {
  console.log('Listening on 3000');
});

process.on('uncaughtException', function(err) {
  console.log('uncaughtException', err.stack);
});
