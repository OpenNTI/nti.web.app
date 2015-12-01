Ext.define('NextThought.model.Video', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.ntivideo',

	statics: {
		mimeType: 'application/vnd.nextthought.ntivideo'
	},

	fields: [
		{name: 'description', type: 'string'},
		{name: 'poster', type: 'string'},
		{name: 'subtitle', type: 'string'},
		{name: 'title', type: 'string'},
		{name: 'sources', type: 'auto'},
		{name: 'transcripts', type: 'auto'},
		{name: 'label', type: 'string'}
	],


	getTitle: function() {
		return this.get('label');
	},

	getPoster: function() {
		return Promise.resolve(this.get('poster'));
	},

	getIcon: function() {
		return this.getPoster();
	}
});
