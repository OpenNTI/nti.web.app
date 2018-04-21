const Ext = require('@nti/extjs');


module.exports = exports = Ext.define('NextThought.util.AnimationFrame', {

	statics: {
		getRequestAnimationFrame () {
			var names = [
					'requestAnimationFrame',
					'webkitRequestAnimationFrame',
					'mozRequestAnimationFrame',
					'msRequestAnimationFrame'
				],
				request;

			request = names.reduce((acc, name) => acc || window[name], null);

			if (!request) {
				request = (callback) => setTimeout(callback, 1000 / 60);
			}

			return request;
		}
	},


	MAX_RUN_TIME: 60000,//For now set it to a minute


	constructor (fn) {
		if (!fn) {
			throw new Error('No function passed to animation frame');
		}

		this.frameFn = fn;
	},



	start () {
		if (this.running) {
			return;
		}


		const startTime = new Date();

		this.stopAnimation = null;

		const onFrame = () => {
			const now = new Date();
			const diff = now - startTime;

			const next = () => requestAnimationFrame(onFrame);

			if (diff < this.MAX_RUN_TIME && !this.stopAnimation) {
				this.frameFn(next, diff);
			}
		};

		onFrame();
		this.running = true;
	},



	stop () {
		this.stopAnimation = true;
	}
});
