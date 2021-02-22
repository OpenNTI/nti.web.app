const Ext = require('@nti/extjs');

module.exports = exports = Ext.define(
	'NextThought.overrides.builtins.Window',
	{}
);

(function () {
	function getRequestAnimationFrame() {
		var names = [
				'webkitRequestAnimationFrame',
				'mozRequestAnimationFrame',
				'msRequestAnimationFrame',
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

	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = getRequestAnimationFrame;
	}
})();
