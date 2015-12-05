const Core = require('../core');
let hasFired = false;

class NavigationTiming {
	onLoad (callback) {
		function safeCallback () {
			if (!hasfired) {
				hasFired = true;
				callback();
			}
		}
		if (document.readyState === 'complete') {
			safeCallback();
		} else {
			window.addEventListener('load', safeCallback);

			document.onreadystatechange = function () {
				if (document.readyState === 'complete') {
					safeCallback();
				}
			};
		}
	}

	track () {

		this.onLoad(() => {

			if (!window.performance || !('timing' in window.performance)) {
				return false;
			}

			// http://stackoverflow.com/questions/7606972/measuring-site-load-times-via-performance-api
			setTimeout(function () {

				const timing = window.performance.timing;
				const start = timing.navigationStart;

				// stepped timings - each metric is calculated from the previous stage
				const stepped = {
					domReadyTime: timing.domComplete - timing.domInteractive,
					readyStart: timing.fetchStart - timing.navigationStart,
					redirectTime: timing.redirectEnd - timing.redirectStart,
					appcacheTime: timing.domainLookupStart - timing.fetchStart,
					unloadEventTime: timing.unloadEventEnd - timing.unloadEventStart,
					lookupDomainTime: timing.domainLookupEnd - timing.domainLookupStart,
					connectTime: timing.connectEnd - timing.connectStart,
					requestTime: timing.responseEnd - timing.requestStart,
					initDomTreeTime: timing.domInteractive - timing.responseEnd,
					loadEventTime: timing.loadEventEnd - timing.loadEventStart,
					loadTime: timing.loadEventEnd - timing.fetchStart
				};

				// offset timings - each metrics is calculated from the first event, i.e. navigation start
				const offset = {
					navigationStart: timing.navigationStart - start,
					unloadEventStart: timing.unloadEventStart - start,
					unloadEventEnd: timing.unloadEventEnd - start,
					redirectStart: timing.redirectStart - start,
					redirectEnd: timing.redirectEnd - start,
					fetchStart: timing.fetchStart - start,
					domainLookupStart: timing.domainLookupStart - start,
					domainLookupEnd: timing.domainLookupEnd - start,
					connectStart: timing.connectStart - start,
					connectEnd: timing.connectEnd - start,
					secureConnectionStart: timing.secureConnectionStart - start,
					requestStart: timing.requestStart - start,
					responseStart: timing.responseStart - start,
					responseEnd: timing.responseEnd - start,
					domLoading: timing.domLoading - start,
					domInteractive: timing.domInteractive - start,
					domContentLoadedEventStart: timing.domContentLoadedEventStart - start,
					domContentLoadedEventEnd: timing.domContentLoadedEventEnd - start,
					domComplete: timing.domComplete - start,
					loadEventStart: timing.loadEventStart - start,
					loadEventEnd: timing.loadEventEnd - start
				};

				Core.track({
					category: 'page',
					action: 'load-time',
					meta: {
						timings: {
							offset: offset,
							stepped: stepped
						}
					}
				});
			}, 0);
		});
	}
}

module.exports = new NavigationTiming();
