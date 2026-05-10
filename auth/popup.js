document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('submitButton').onclick = function() {
		chrome.runtime.sendMessage({
			'_setPassword': true,
			'password': document.getElementById('pwd').value
		});
		window.close();
	};
	setTimeout(function() {
		document.getElementById('pwd').focus();
	}, 500);
}, false);
