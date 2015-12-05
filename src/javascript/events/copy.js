const Core = require('../core');

class Copy {

	init () {
		document.addEventListener('copy', function (ev) {

			const el = ev.target;
			const nodeName = el.nodeName.toLowerCase();
			const selectedText = window.getSelection && window.getSelection().toString();

			const data = {
				action: 'copy',
				category: 'text',
				meta: {
					selectedText: window.getSelection && window.getSelection().toString(),
					selectionUndetectable: !window.getSelection,
					selectionLength: selectedText && selectedText.length
				},
				context: {
					domPath: utils.getDomPath(el)
				}
			};

			Core.track(data);
		});
	}
}

module.exports = Copy;
