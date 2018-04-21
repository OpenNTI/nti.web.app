const Ext = require('@nti/extjs');
require('legacy/model/Base');


module.exports = exports = Ext.define('NextThought.model.assessment.Part', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'content', type: 'string' },
		{ name: 'hints', type: 'arrayItem' },
		{ name: 'solutions', type: 'arrayItem', limit: 1 },
		{ name: 'explanation', type: 'string' },
		{ name: 'answerLabel', type: 'string' }
	],

	getVideos: function () {
		var out = [],
			dom = new DOMParser().parseFromString(this.get('content'), 'text/xml');

		Ext.each(dom.querySelectorAll('object.naqvideo'), function (i) {
			var o = {};
			Ext.each(i.getElementsByTagName('param'), function (p) {
				o[p.getAttribute('name')] = p.getAttribute('value');
			});
			out.push(o);
		});

		return out;
	},

	hasSolutions: function () {
		var solutions = this.get('solutions');

		return solutions && solutions.length > 0;
	}
});
