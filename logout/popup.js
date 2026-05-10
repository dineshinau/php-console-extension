document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('logoutButton').onclick = function() {
		chrome.runtime.sendMessage({
			'_logout': true
		});
		window.close();
	};
}, false);
