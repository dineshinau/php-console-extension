document.addEventListener('DOMContentLoaded', function() {

	chrome.runtime.sendMessage({_getActiveTab: true}, function(tabResponse) {
		var domain = tabResponse.domain;

		var optionKeys = [
			'consoleDebug', 'consoleErrors', 'consoleCollapseNoErrors',
			'evalClearConsole', 'evalShowTime',
			'notifyDebug', 'notifyErrors', 'notifyJavaScriptErrors',
			'notifyJumpToFile', 'notifyCopyToClipboard', 'notifyLifeTime'
		];

		chrome.runtime.sendMessage({_getOptions: true, keys: optionKeys}, function(optionValues) {

			chrome.runtime.sendMessage({_getServer: true, domain: domain}, function(server) {

				var checkboxes = document.querySelectorAll('[type="checkbox"]');
				for(var i = 0; i < checkboxes.length; i++) {
					var checkbox = checkboxes.item(i);
					checkbox.checked = optionValues[checkbox.id] || false;
					checkbox.addEventListener('change', function() {
						chrome.runtime.sendMessage({_setOption: true, key: this.id, value: this.checked});
					});
				}

				function getHtml(containerId, item, isSelected) {
					return '<label for="' + containerId + item + '" class="pure-checkbox"><input id="' + containerId + item + '" type="checkbox" ' + (isSelected ? 'checked="checked"' : '') + ' value="' + item + '"> ' + item + '</label>';
				}

				function initList(containerId, optionName, items) {
					var selectedItems = server[optionName];
					var html = '';
					for(var item in selectedItems) {
						html = html + getHtml(containerId, item, selectedItems[item]);
					}
					for(var i in items) {
						if(typeof selectedItems[item] == 'undefined') {
							html = html + getHtml(containerId, items[i], selectedItems[item]);
						}
					}
					document.getElementById(containerId).innerHTML = html;

					var checkboxes = document.querySelectorAll('#' + containerId + ' [type="checkbox"]');
					for(var i = 0; i < checkboxes.length; i++) {
						var checkbox = checkboxes.item(i);
						// save list option
						checkbox.addEventListener('change', function() {
							var checked = [];
							var unchecked = [];
							var opt = {};
							opt[optionName] = {};
							for(var ii = 0; ii < checkboxes.length; ii++) {
								var ch = checkboxes.item(ii);
								ch.checked ? checked.push(ch.value) : unchecked.push(ch.value);
							}
							checked.sort();
							unchecked.sort();
							for(var ii in checked) {
								opt[optionName][checked[ii]] = true;
							}
							for(var ii in unchecked) {
								opt[optionName][unchecked[ii]] = false;
							}
							chrome.runtime.sendMessage({_updateServer: true, domain: domain, data: opt});
						});
					}
				}

				var lifeTimeSelect = document.getElementById('notifyLifeTime');
				for(var i in lifeTimeSelect.options) {
					if(lifeTimeSelect.options[i].value == optionValues['notifyLifeTime']) {
						lifeTimeSelect.selectedIndex = i;
					}
				}
				lifeTimeSelect.addEventListener('change', function() {
					chrome.runtime.sendMessage({
						_setOption: true,
						key: 'notifyLifeTime',
						value: lifeTimeSelect.item(lifeTimeSelect.selectedIndex).value
					});
				});

				var errors = [
					'E_STRICT',
					'E_DEPRECATED',
					'E_RECOVERABLE_ERROR',
					'E_NOTICE',
					'E_WARNING',
					'E_ERROR',
					'E_PARSE',
					'E_USER_DEPRECATED',
					'E_USER_NOTICE',
					'E_USER_WARNING',
					'E_USER_ERROR',
					'E_CORE_WARNING',
					'E_CORE_ERROR',
					'E_COMPILE_ERROR',
					'E_COMPILE_WARNING'
				];

				initList('errorContainer', 'ignoreErrors', errors);
				initList('debugContainer', 'ignoreDebug', []);

			});
		});
	});
});
