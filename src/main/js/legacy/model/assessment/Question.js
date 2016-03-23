const Ext = require('extjs');
require('legacy/model/Base');
require('legacy/model/assessment/WordBank');


module.exports = exports = Ext.define('NextThought.model.assessment.Question', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.naquestion',

	fields: [
		{ name: 'content', type: 'auto' },
		{ name: 'parts', type: 'arrayItem' },
		{ name: 'wordbank', type: 'singleItem' },
		{ name: 'containerId', type: 'string'},
		{ name: 'ContentRoot', type: 'string'}
	],

	getVideos: function () {
		var all = NextThought.model.assessment.Part.prototype.getVideos.call(this);
		Ext.each(this.get('parts'), function (p) {
			all.push.apply(all, p.getVideos());
		});
		return all;
	},

	tallyParts: function () {
		return 1;
		//function sum(agg, r) {
		//return agg + (r.tallyParts ? r.tallyParts() : 1);
		//}
		//return (this.get('parts') || []).reduce(sum, 0);
	}
});
