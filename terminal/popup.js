document.addEventListener('DOMContentLoaded', function() {
	var tabId = null;
	var domain = null;
	var historyLimit = 20;
	var currentIndex = -1;
	var currentCode = '';
	var codeNode = null;

	function storeCurrentCode(code) {
		currentCode = code;
		chrome.storage.local.get('evalCurrents', function(data) {
			var currents = data['evalCurrents'] ? JSON.parse(data['evalCurrents']) : {};
			currents[domain] = {'code': code, 'pos': codeNode.selectionStart};
			chrome.storage.local.set({'evalCurrents': JSON.stringify(currents)});
		});
	}

	function initCurrentStoredCode() {
		chrome.storage.local.get('evalCurrents', function(data) {
			var currents = data['evalCurrents'] ? JSON.parse(data['evalCurrents']) : {};
			var current = currents[domain] ? currents[domain] : null;
			if(current) {
				currentCode = current['code'];
				codeNode.focus();
				codeNode.value = currentCode;
				codeNode.setSelectionRange(current['pos'], current['pos']);
			}
		});
	}

	function storeCodeInHistory(code) {
		getDomainCodeHistory(function(history) {
			if(history[0] != code) {
				history.unshift(code);
				if(history.length > historyLimit) {
					history.pop();
				}
			}
			setDomainCodeHistory(history);
			currentIndex = 0;
		});
	}

	function getDomainCodeHistory(callback) {
		chrome.storage.local.get('evalHistory', function(data) {
			var history = data['evalHistory'] ? JSON.parse(data['evalHistory']) : {};
			callback(history[domain] ? history[domain] : []);
		});
	}

	function setDomainCodeHistory(domainHistory) {
		chrome.storage.local.get('evalHistory', function(data) {
			var history = data['evalHistory'] ? JSON.parse(data['evalHistory']) : {};
			history[domain] = domainHistory;
			chrome.storage.local.set({'evalHistory': JSON.stringify(history)});
		});
	}

	function getPreviousCode(callback) {
		getDomainCodeHistory(function(history) {
			if(currentIndex < historyLimit && (currentIndex + 1 < history.length)) {
				currentIndex++;
				callback(history[currentIndex]);
			}
		});
	}

	function getNextCode(callback) {
		getDomainCodeHistory(function(history) {
			if(currentIndex > 0) {
				currentIndex--;
				callback(history[currentIndex]);
			}
		});
	}

	// construct

	document.getElementById('logoutButton').onclick = function() {
		chrome.runtime.sendMessage({
			'_logout': true
		});
		window.close();
	};

	chrome.runtime.sendMessage({_getActiveTab: true}, function(response) {
		tabId = response.tabId;
		domain = response.domain;

		codeNode = document.getElementById('code');
		initCurrentStoredCode();

		codeNode.onclick = function() {
			storeCurrentCode(codeNode.value);
		};

		document.onkeyup = function(event) {
			var key = event.keyCode || event.which;
			if(event.ctrlKey) {
				// ctrl + enter
				if(key == 0xA || key == 0xD) {
					if(codeNode.value.trim()) {
						storeCodeInHistory(codeNode.value);
						codeNode.className = 'send';
						chrome.runtime.sendMessage({
							'_evalCode': true,
							'code': codeNode.value,
							'tabId': tabId
						}, function() {
							codeNode.className = '';
						});
					}
				}
				// ctrl + page up/down
				else {
					if(key == 38 || key == 40) {
						var handler = function(code) {
							if(code) {
								codeNode.value = code;
							}
						};
						key == 38 ? getPreviousCode(handler) : getNextCode(handler);
					}
				}
			}
			// tab key
			else {
				if(key == 9) {
					event.preventDefault();
					var unTab = event.shiftKey;
					var code = codeNode.value;
					var start = codeNode.selectionStart;
					var end = codeNode.selectionEnd;
					if((start - end) || unTab) {
						for(var nlPos = start; nlPos; nlPos--) {
							if(code.charAt(nlPos - 1) == "\n") {
								break;
							}
						}
						var newStart = start + (unTab
								? (/^\t/.exec(code.substring(nlPos, end)) ? -1 : 0)
								: 1
							);
						if(newStart < 0) {
							newStart = 0;
						}

						var tabbedCode = unTab
							? code.substring(nlPos, end).replace(/^\t/, '').replace(/\n\t/g, "\n")
							: "\t" + code.substring(nlPos, end).replace(/\n/g, "\n\t");

						codeNode.value = code.substring(0, nlPos)
						+ tabbedCode
						+ code.substring(end);

						codeNode.setSelectionRange(newStart, nlPos + tabbedCode.length);
						codeNode.focus();
					}
					else {
						codeNode.value = code.substring(0, start) + "\t" + code.substring(end);
						codeNode.setSelectionRange(start + 1, start + 1);
					}
				}
				// enter
				else {
					if(key == 0xA || key == 0xD) {
						var code = codeNode.value;
						var start = codeNode.selectionStart;
						var end = codeNode.selectionEnd;
						var tab = code.charAt(start - 2) == '{' ? "\t" : '';
						for(var nlPos = start - 1; nlPos; nlPos--) {
							if(code.charAt(nlPos - 1) == "\n") {
								for(var i = nlPos; code.charAt(i) == "\t"; i++) {
									tab = tab + "\t";
								}
								break;
							}
						}
						if(tab) {
							codeNode.value = code.substring(0, start) + tab + code.substring(end);
							codeNode.setSelectionRange(start + tab.length, start + tab.length);
						}
					}
				}
			}
			storeCurrentCode(codeNode.value);
		};
	});

}, false);
