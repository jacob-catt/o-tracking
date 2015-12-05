const Core = require('../core');
const utils = require('../utils');
const oViewport = require('o-viewport');
const throttle = require('lodash/function/throttle');

class ScrollDepth {
	constructor (options) {
		options = options || {};
		this.el = options.el || window;
		this.increment = options.increment || 10;
		this.incrementsViewed = 0;
	}

	init () {
		this.trackScroll(true)
		if (this.el === window) {
			// track scroll depth
			oViewport.listenTo('scroll');
			document.body.addEventListener('oViewport.scroll', () => {
				this.trackScroll();
			});

			// set up tracking for children which are scrollable
			const queryableEl = this.el === window ? document : this.el;
			[].forEach.call(queryableEl.querySelectorAll('[data-o-tracking-scrollable]'), el => {
				new ScrollDepth({
					el: el,
					slices: el.getAttribute('data-o-tracking-scrollable--slices')
				});
			});
		} else {
			// track scrolling efficiently for non window
			this.el.addEventListener('scroll', throttle(ev => {
				this.trackScroll();
			}, 100))
		}
	}

	trackScroll (isInitial) {

		const depth = this.getScrollDepth();
		const increment = Math.floor(depth * 100 / increment) * increment;

		if (!isInitial && increment <= this.incrementsViewed) {
			return;
		}

		this.incrementsViewed = increment;

		const data = {
			action: 'scroll',
			meta: {
				depth: this.incrementsViewed
			}
		}

		if (isInitial) {
			data.meta.initialState = true;
		}

		if (this.el === window) {
			data.category = 'page';
		} else {
			data.category = 'component';
			data.context.domPath = utils.getDomPath(this.el);
		}

		// TODO do we need to also send all 'smaller' percentages why???
		// Can't we jsut query by less than or equal to?
		Core.track(data);
	}

	getScrollDepth () {
		const viewport = oViewport.getSize();
		if (this.el === window) {
			const scrollData = viewport.getScrollPosition()
			return (viewport.height + scrollData.top ) / scrollData.height;
		} else {
			const scrollData = this.el.getBoundingClientRect();
			const offScreen = Math.max(scrollData.bottom - viewport.height, 0)
			return (this.el.scrollTop + scrollData.height - offScreen) / this.el.scrollHeight;
		}
	}


	// getProportionViewable () {
	// 	const viewport = oViewport.getSize();
	// 	if (this.el === window) {
	// 		const scrollData = viewport.getScrollPosition()
	// 		return viewport.height / scrollData.height;
	// 	} else {
	// 		const scrollData = this.el.getBoundingClientRect();
	// 		const offScreen = Math.max(scrollData.bottom - viewport.height, 0) + Math.max(-scrollData.top, 0)
	// 		return (scrollData.height - offScreen) / this.el.scrollHeight;
	// 	}
	// }
}

module.exports = ScrollDepth;
