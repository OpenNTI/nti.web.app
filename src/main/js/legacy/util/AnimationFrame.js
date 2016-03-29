var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.util.AnimationFrame', {

	statics: {
		getRequestAnimationFrame: function () {
			var names = [
					'requestAnimationFrame',
					'webkitRequestAnimationFrame',
					'mozRequestAnimationFrame',
					'msRequestAnimationFrame'
				],
				request;

			request = names.reduce(function (acc, name) {
				return acc || window[name];
			}, null);

			if (!request) {
				request = function (callback) {
					return setTimeout(callback, 1000 / 60);
				};
			}

			return request;
		}
	},


	MAX_RUN_TIME: 60000,//For now set it to a minute


	constructor: function (fn) {
		if (!fn) {
			throw 'No function passed to animation frame';
		}

		this.frameFn = fn;
	},



	start: function () {
		if (this.running) {
			return;
		}

		var me = this,
			startTime = new Date();

		me.stopAnimation = null;

		function onFrame () {
			var now = new Date(),
				diff = now - startTime;

			function next () {
				requestAnimationFrame(onFrame);
			}

			if (diff < me.MAX_RUN_TIME && !me.stopAnimation) {
				me.frameFn(next, diff);
			}
		}

		onFrame();
		this.running = true;
	},



	stop: function () {
		this.stopAnimation = true;
	}
});
