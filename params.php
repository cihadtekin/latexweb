<?php
$ds = DIRECTORY_SEPARATOR;
$host = (
	// Protocol
	((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == 443)
		? "https"
		: "http"
) . '://' . (
	// Domain
	isset($_SERVER['HTTP_HOST'])
		? str_replace(':' . $_SERVER['SERVER_PORT'], '', $_SERVER['HTTP_HOST']) // Clear port
		: $_SERVER['SERVER_NAME']
);
$host = trim($host, '/');
$base = $host . '/' . trim(str_replace(array('/', '\\'), $ds, dirname($_SERVER['SCRIPT_NAME'])), $ds);
$node = $host . ':3000';

return [
	'title' => 'Latex Web',
	'host' => $host,
	'baseurl' => $base . '/',
	'sample' => file_get_contents('samples/1.tex'),
	'downloadUrl' => $node . '/result-pdf',
	'js' => json_encode(array(
		'previewUrl' => $node . '/preview',
	))
];
