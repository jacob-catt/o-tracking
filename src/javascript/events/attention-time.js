const Core = require('../core');


const ATTENTION_INTERVAL = 5000;
const ATTENTION_EVENTS = ['load', 'click', 'focus', 'scroll', 'mousemove', 'touchstart', 'touchend', 'touchcancel', 'touchleave'];
const UNATTENTION_EVENTS = ['blur'];
const eventToSend = ('onbeforeunload' in window) ? 'beforeunload' : 'unload';
let hasSent = false;
let i;


class Attention {
	constructor () {
		this.totalAttentionTime = 0;
		this.startAttentionTime;
		this.endAttentionTime;
	}

	init () {
		//Add events for all the other Attention events
		for (i = 0; i < ATTENTION_EVENTS.length; i++) {
			window.addEventListener(ATTENTION_EVENTS[i], ev => startAttention(ev));
		}

		for (i = 0; i < UNATTENTION_EVENTS.length; i++) {
			window.addEventListener(UNATTENTION_EVENTS[i], ev => this.endAttention(ev));
		}

		//Use Page Visibility API if it exists
		if (document.visibilityState) {
			document.addEventListener('visibilitychange', ev => this.handleVisibilityChange(ev), false);
		}

		this.addVideoEvents();

		// Add event to send data on unload
		window.addEventListener(eventToSend, () => {
			this.endAttention();
			Core.track({
				category: 'page',
				action: 'attention',
				attention: this.totalAttentionTime
			});
		});

	}

	startAttention (ev) {
		clearTimeout(this.attentionTimeout);
		if(!this.startAttentionTime) {
			this.startAttentionTime = (new Date()).getTime();
		}
		this.attentionTimeout = setTimeout(() => this.endAttention(), ATTENTION_INTERVAL);
	}

	startConstantAttention () {
		this.constantAttentionInterval = setInterval(() => this.startAttention(), ATTENTION_INTERVAL);
	}

	endConstantAttention () {
		this.endAttention();
		clearInterval(this.constantAttentionInterval);
	}

	endAttention () {
		if(this.startAttentionTime) {
			this.endAttentionTime = (new Date()).getTime();
			this.totalAttentionTime += Math.round((this.endAttentionTime - this.startAttentionTime)/1000);
			clearTimeout(this.attentionTimeout);
			this.startAttentionTime = null;
		}
	}

	addVideoEvents () {
		this.videoPlayers;
		if (window.FTVideo) {
			this.videoPlayers = document.getElementsByClassName('BrightcoveExperience');
			for (var i = 0; i < this.videoPlayers.length; i++) {
				FTVideo.createPlayerAsync(this.videoPlayers[i].id, function(player) {
					player.on(player.MEDIA_PLAY_EVENT, startConstantAttention);
					player.on(player.MEDIA_STOP_EVENT, endConstantAttention);
				});
			}
		} else {
			this.videoPlayers = document.getElementsByTagName('video');
			for (var i = 0; i < this.videoPlayers.length; i++) {
				this.videoPlayers[i].addEventListener('playing', startConstantAttention);
				this.videoPlayers[i].addEventListener('pause', endConstantAttention);
				this.videoPlayers[i].addEventListener('ended', endConstantAttention);
			}
		}
	}

	handleVisibilityChange (ev) {
		if (document.hidden) {
			this.endAttention(ev);
		} else {
			this.startAttention(ev);
		}
	}

}

module.exports = new Attention();
