const Core = require('../core');
const oElementVisibility = require('o-element-visibility');

class Visibility {

	init () {
		// track element visibility
		oElementVisibility.init('[data-o-tracking-visibility]');
		document.body.addEventListener('oVisibility.visible', ev => {
			this.trackVisibility(ev);
		})
	}

	trackVisibility (ev) {

		if (ev.detail.percentInView > 50 && !ev.detail.el.hasAttribute('data-o-tracking-visibility--tracked')) {
			ev.detail.el.setAttribute('data-o-tracking-visibility--tracked', '');
			const data = {
				category: 'component',
				action: 'view',
				context: {
					domPath: utils.getDomPath(ev.detail.el)
				}
			}
			Core.track(data);
		}
	}
}

module.exports = Visibility;
