Ext.define('NextThought.model.courses.overview.Lesson', {
	extend: 'NextThought.model.Base',

	mimeType: 'application/vnd.nextthought.ntilessonoverview',

	fields: [
		{name: 'title', type: 'String'},
		{name: 'Items', type: 'arrayItem'}
	]
});
