var app = require('express')();
var _ = require('lodash');
var fs = require('fs');
var child_process = require('child_process');
var tmpDir = __dirname + '/tmp/';

// Clear tmpDir
fs.readdir(tmpDir, function(err, files) {
	for (var i = 0; i < files.length; i++) {
		fs.unlink(tmpDir + files[i]);
	}
});

function Preview(source, complete, opts) {
	var self = this;
	/**
	 * All options
	 * @type {Object}
	 */
	self.opts = _.defaults(opts, {
		standby: 1000,
		interval: 50,
		lastOutput: Date.now(),
		fileName: Date.now() + '.tex'  // Temporary file's name
	});
	/**
	 * Source to compile
	 * @type {String}
	 */
	self.source = source;
	/**
	 * child_process object
	 * @type {Object}
	 */
	self.process = null;
	/**
	 * Stuck control
	 * @type {Number}
	 */
	self.intervalID = setInterval(function() {
		if (Date.now() - self.opts.lastOutput > self.opts.standby) {
			self.process && self.process.kill();
			self.intervalID && clearInterval(self.intervalID);
			return complete(
				new PreviewError('Process couldn\'t complete')
			);
		}
	}, self.opts.interval);

	// Write input to a temporary file
	fs.writeFile(tmpDir + self.opts.fileName, source, function(err) {
		// Finish on error
		if (err) {
			self.intervalID && clearInterval(self.intervalID);
			return complete(
				new PreviewError('Source couldn\'t write to a temporary file')
			);
		}
		// File created, process continues
		self.opts.lastOutput = Date.now();
		// Run latex
		self.process = child_process.exec(
			'cd ' + tmpDir + ' && ' + 
			'pdflatex -shell-escape ' + tmpDir + self.opts.fileName + '',
			function(error, stdout, stderr) {
				if (error !== null) {
					self.intervalID && clearInterval(self.intervalID);
					return complete(
						new PreviewError(
							"Latex has encountered an error"
						)
					);
				}

				self.intervalID && clearInterval(self.intervalID);
				return complete({
					success: true
				});
			}
		);
		// Listen outputs
		self.process.stdout.on('data', function(data) {
			lastOutput = Date.now();
		});
	});
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

	new Preview(
		"\\documentclass[preview,border=12pt,12pt}]{standalone}" + "\n" +
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
		"\\end{document}",
		function(result) {
			res.json(result);
		}
	);
});

app.listen(3000, function() {
	console.log('Listening on 3000');
});

/*
var standby = 1000;
var interval = 50;
var lastOutput = Date.now();
var proc = child_process.exec('latex intro.tex');

proc.stdout.on('data', function(data) {
	lastOutput = Date.now();
});

var iid = setInterval(function() {
	if (Date.now() - lastOutput > standby) {
		proc.kill();
		clearInterval(iid);
	}
}, interval);
*/