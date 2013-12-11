Ext.define('NextThought.model.courseware.navigation.CourseOutlineNode', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'DCDescription', type: 'string'},
		{name: 'DCTitle', type: 'string'},
		{name: 'contents', type: 'arrayItem'},
		{name: 'description', type: 'string'},
		{name: 'title', type: 'string'}
	]

});
