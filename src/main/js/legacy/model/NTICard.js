var Ext = require('extjs');
var ModelRelatedWork = require('./RelatedWork');


module.exports = exports = Ext.define('NextThought.model.NTICard', {
	extend: 'NextThought.model.RelatedWork',
	mimeType: 'application/vnd.nextthought.nticard',

	statics: {
		mimeType: 'application/vnd.nextthought.nticard'
	},

	fields: [
		{ name: 'byline', type: 'string', convert(v, r) {
			return v || r.raw.creator || r.raw.Creator;
		} },
		{ name: 'label', type: 'string', convert(v, r) {
			return v || r.raw.title;
		} }
	],

	getIcon (root = '') {
		return root + this.raw.image;
	}
});
