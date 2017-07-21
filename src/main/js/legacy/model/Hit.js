const Ext = require('extjs');

require('./Base');

module.exports = exports = Ext.define('NextThought.model.Hit', {
	extend: 'NextThought.model.Base',
	idProperty: null,

	statics: {
		mimeType: [
			'application/vnd.nextthought.search.searchhit',
			'application/vnd.nextthought.search.contentunitsearchhit',
			'application/vnd.nextthought.search.ugdsearchhit',
			'application/vnd.nextthought.search.transcriptsearchhit'
		]
	},

	fields: [
		{ name: 'Snippet', type: 'string' },
		{ name: 'Title', type: 'string' },
		{ name: 'Type', type: 'string' },
		{ name: 'TargetMimeType', type: 'string' },
		{ name: 'Containers', type: 'auto'},
		{ name: 'Fragments', type: 'auto'},
		{ name: 'Score', type: 'auto'},
		{ name: 'StartMilliSecs', type: 'auto' },
		{ name: 'EndMilliSecs', type: 'auto' },
		{ name: 'VideoID', type: 'string'},
		//This really needs to move up onto a SearchResult object but we don't have that.  The proxy roots at Items
		{ name: 'PhraseSearch', type: 'auto'}
	],

	//We don't use the idProperty because there isn't a unique id,
	//but for legacy reasons people expect to call getId and get the ntiid
	getId: function () {
		return this.get('NTIID');
	},

	isContent: function () {
		const target = this.get('TargetMimeType');

		return (/contentunit/i).test(target);
	}
});
