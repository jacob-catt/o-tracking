/*global module, require, window */
"use strict";

var settings = require("./settings");
var utils = require("../utils");
var Queue = require("./queue");

/**
 * Default collection server.
 */
var domain = "http://test.spoor-api.ft.com";

/**
 * Queue queue.
 *
 * @type {Queue}
 */
var queue;
/**
 * Requests being sent right now.
 */
var currentRequests = {};

function createXMLHttp() {
	try {
		var xmlHttp = new window.XMLHttpRequest();

		// Check if the XMLHttpRequest object has a "withCredentials" property.
		// "withCredentials" only exists on XMLHTTPRequest2 objects.
		if (!utils.isUndefined(xmlHttp.withCredentials)) {
			return {
				xmlHttp: xmlHttp,
				XDomainRequest: false
			};
		}

		// Otherwise, check if XDomainRequest.
		// XDomainRequest only exists in IE, and is IE's way of making CORS requests.
		if (!utils.isUndefined(window.XDomainRequest)) {
			return {
				xmlHttp: new window.XDomainRequest(),
				XDomainRequest: true
			};
		}
	} catch (error) {
		try {
			return {
				xmlHttp: new window.ActiveXObject("Microsoft.XMLHTTP"),
				XDomainRequest: false
			};
		} catch (err) {}
	}

	return null;
}

/**
 * Marks a request as current.
 *
 * @param id {String} The ID of the request.
 */
function started(id) {
	currentRequests[id] = true;
}

/**
 * Marks a request as no longer current.
 *
 * @param id {String} The ID of the request.
 */
function finished(id) {
	delete currentRequests[id];
}

/**
 * Marks a request as no longer current and removes it from the queue.
 *
 * @param id {String} The ID of the request.
 */
function success(id) {
	finished(id);

	var replacement = queue.all(),
		i;

	for (i = 0; i < replacement.length; i = i + 1) {
		if (id === replacement[i].id) {
			replacement.splice(i, 1);
			queue.replace(replacement).save();
			break;
		}
	}
}

/**
 * Attempts to send a tracking request.
 *
 * @param request {Object} The request to be sent.
 * @param callback {Function} Callback to fire the next item in the queue.
 */
function sendRequest(request, callback) {
	var offlineLag = (new Date()).getTime() - request.queueTime,
		path,
		xmlHttpObj = createXMLHttp(),
		xmlHttp,
		user_callback = request.callback;

	if (!xmlHttpObj) {
		return;
	}

	request = utils.merge({
		meta: {
			api_key: settings.get('api_key'), // String - API key - Make sure the request is from a valid client (idea nicked from Keen.io) useful if a page gets copied onto a Russian website and creates noise
			version: settings.get('version'), // Version of the tracking client e.g. "1.2"
			source: settings.get('source'), // Source of the tracking client e.g. "o-tracking"
			id: request.id, // ID of this request
			counter: request.counter,
			offset: 0 // Delay of this event between event happening and being sent to server - milliseconds
		}
	}, request);

	// Only bothered about offlineLag if it's longer than a second, but less than a month. (Especially as Date can be dodgy)
	if (offlineLag > 1000 && offlineLag < (31 * 24 * 60 * 60 * 1000)) {
		request.meta.offset = offlineLag;
	}

	xmlHttp = xmlHttpObj.xmlHttp;

	delete request.counter;
	delete request.callback;
	delete request.async;
	delete request.type;
	delete request.queueTime;

	utils.log('user_callback', user_callback);
	utils.log('PreSend', request);

	function requestFinished(xmlHttp) {
		if (utils.is(user_callback, 'function')) {
			user_callback.call(request, xmlHttp);
			utils.log('calling user_callback');
		}
		if (xmlHttp.status >= 200 && xmlHttp.status < 300) {
			success(request.id);
			callback();
		} else {
			finished(request.id);
			// TODO Wait a bit, then try again?
		}
	}

	started(request.id);

	path = JSON.stringify(request);

	utils.log('path', path);

	if (!xmlHttpObj.XDomainRequest) {
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState === 4) {
				requestFinished(xmlHttp);
			}
		};
	} else {
		xmlHttp.onload = function () {
			requestFinished(xmlHttp);
		};
	}

	// Only works with XMLHttpRequest
	xmlHttp.onerror = function () { requestFinished(xmlHttp); };

	// Both developer and noSend flags have to be set to stop the request sending.
	if (!(settings.get('developer') && settings.get('noSend'))) {
		xmlHttp.open('POST', domain, true);
		// XDomainRequest doesn't like this header
		if (!xmlHttpObj.XDomainRequest) {
			xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		}

		xmlHttp.send(path);
	}
}

/**
 * Adds a new request to the list of pending requests
 *
 * @param request The request to queue
 */
function add(request) {
	request.queueTime = (new Date()).getTime();

	queue.add(request).save();

	utils.log('AddedToQueue', queue);
}

/**
 * If there are any requests queued, attempts to send the next one
 * Otherwise, does nothing
 * @param {Function} Callback, optional
 */
function run(callback) {
	if (utils.isUndefined(callback)) {
		callback = function () {};
	}

	var next = function () { run(); callback(); },
		nextRequest = queue.first();

	// Cancel if we've run out of requests.
	if (!nextRequest) {
		return callback();
	}

	// Cancel if the request is already started.
	if (currentRequests[nextRequest.id]) {
		return callback();
	}

	// Send this request, then try run again.
	return sendRequest(nextRequest, next);
}

/**
 * Convenience function to add and run a request all in one go.
 *
 * @param request {Object} The request to queue and run.
 */
function addAndRun(request) {
	add(request);
	run();
}

/**
 * Init the queue and send any leftover events.
 */
function init() {
	queue = new Queue('requests');

	if (settings.get('config') && settings.get('config').server) {
		domain = settings.get('config').server;
	}

	// If any tracking calls are made whilst offline, try sending them the next time the device comes online
	utils.addEvent(window, 'online', run);

	// On startup, try sending any requests queued from a previous session.
	run();
}

module.exports = {
	init: init,
	add: add,
	run: run,
	addAndRun: addAndRun
};
