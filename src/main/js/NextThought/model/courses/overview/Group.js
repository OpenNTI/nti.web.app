Ext.define('NextThought.model.courses.overview.Group', {
	extend: 'NextThought.model.Base',

	mixins: {
		OrderedContents: 'NextThought.mixins.OrderedContents'
	},

	statics: {
		mimeType: 'application/vnd.nextthought.nticourseoverviewgroup',

		COLOR_CHOICES: [
			'F35252',//red
			'FA8700', //orange
			'3fb3f6', //blue
			'8eb737', //green
			'e41717',//red
			'FA8700'//orange
		]
	},

	mimeType: 'application/vnd.nextthought.nticourseoverviewgroup',

	fields: [
		{name: 'title', type: 'String'},
		{name: 'accentColor', type: 'String'},
		{name: 'Items', type: 'arrayItem'}
	]
});
