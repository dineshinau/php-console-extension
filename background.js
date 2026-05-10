// PHP Console - Service Worker (Manifest V3)
importScripts(
	'js/sha256.js',
	'js/options.js',
	'js/auth.js',
	'js/messages.js',
	'js/headers.js',
	'js/notifications.js',
	'js/app.js'
);

// Disable action icon globally by default (MV3 action is always visible unlike pageAction).
// It gets enabled per-tab when a PHP Console server is detected.
chrome.action.disable();
