

var child_process = require('child_process');
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

