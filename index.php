<!DOCTYPE html>
<html lang="en">
<head>
	<?php extract(include 'params.php') ?>
	<title><?= $title ?></title>
	<meta charset="utf-8">
	<link rel="stylesheet" type="text/css" href="assets/stylesheet.css">
	<script type="text/javascript">
		var params = <?= $js ?>;
	</script>
</head>
<body>


<div id="editor">
	<div id="ace-editor"><?= $sample ?></div>
</div>

<div id="settings">
	<h3>Controls</h3>
	<div>
		<label>Key press interval (ms)</label>
		<input type="text" name="pollingInterval" value="300" style="width: 100px" />
	</div>

	<form action="<?= $downloadUrl ?>" method="post" target="_blank">
		<input name="source" type="hidden" id="source-input">
		<button type="submit">Download as PDF</button>
		<button type="button" id="clear-cache">Clear all cache</button>
	</form>
</div>

<div id="preview"></div>

<script type="text/javascript" src="node_modules/jquery/dist/jquery.min.js"></script>
<script type="text/javascript" src="node_modules/ace-editor-builds/src-min-noconflict/ace.js"></script>
<script type="text/javascript" src="assets/client.js"></script>
</body>
</html>