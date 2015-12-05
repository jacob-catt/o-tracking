/*global module*/

module.exports = function(config) {
	config.set({

		frameworks: ['mocha', 'browserify', 'sinon'],
		files: [
			'http://polyfill.webservices.ft.com/v1/polyfill.js?ua=safari/4',
			'test/**/*.test.js'
		],

		preprocessors: {
			'test/**/*.test.js': ['browserify']
		},

		reporters: ['progress'],

		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		browsers: ['PhantomJS'],
		singleRun: false,

		browserify: {
			debug: true,
			transform: [ 'babelify', 'debowerify' ]
		}

	});
};
