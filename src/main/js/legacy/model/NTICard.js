const Ext = require('extjs');

require('./RelatedWork');


module.exports = exports = Ext.define('NextThought.model.NTICard', {
	extend: 'NextThought.model.RelatedWork',
	mimeType: 'application/vnd.nextthought.nticard',

	statics: {
		mimeType: 'application/vnd.nextthought.nticard'
	},

	fields: [
		{ name: 'byline', type: 'string', convert (v, r) {
			return v || r.raw.creator || r.raw.Creator;
		} },
		{ name: 'label', type: 'string', convert (v, r) {
			return v || r.raw.title;
		} },
		{ name: 'icon', type: 'string', convert (v, r) {
			return v || r.raw.image;
		} }
	]
});
