Ext.define('NextThought.model.courses.overview.Group', {
	extend: 'NextThought.model.Base',

	statics: {
		mimeType: 'application/vnd.nextthought.nticourseoverviewgroup'
	},

	mimeType: 'application/vnd.nextthought.nticourseoverviewgroup',

	fields: [
		{name: 'title', type: 'String'},
		{name: 'accentColor', type: 'String'},
		{name: 'Items', type: 'arrayItem'}
	]
});
