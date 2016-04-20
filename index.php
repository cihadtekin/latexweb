<!DOCTYPE html>
<html lang="en">
<head>
	<title>Latex Web</title>
	<meta charset="utf-8">
	<link rel="stylesheet" type="text/css" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
	<link rel="stylesheet" type="text/css" href="node_modules/bootstrap/dist/css/bootstrap-theme.min.css">
	<link rel="stylesheet" type="text/css" href="assets/stylesheet.css">
</head>
<body>

<div id="editor">
	<div id="ace-editor"><?php echo file_get_contents('samples/1.tex') ?></div>
</div>

<div id="settings">
	<h3>Settings</h3>
	<label>Polling time</label>
	<input type="text" name="pollingInterval" value="300" />
</div>

<div id="preview"></div>

<script type="text/javascript" src="node_modules/jquery/dist/jquery.min.js"></script>
<script type="text/javascript" src="node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
<script type="text/javascript" src="node_modules/ace-editor-builds/src-min-noconflict/ace.js"></script>
<script type="text/javascript" src="client.js"></script>
</body>
</html>