chrome.runtime.onMessage.addListener(function(request) {
	if (request.type === 'clipboard-copy') {
		var textareaNode = document.getElementById('textarea');
		textareaNode.value = request.text;
		textareaNode.select();
		document.execCommand('Copy', false, null);
	} else if (request.type === 'editor-open') {
		document.getElementById('debug').setAttribute(
			'src',
			'editor://open/?file=' + encodeURIComponent(request.file) + '&line=' + encodeURIComponent(request.line)
		);
	}
});
