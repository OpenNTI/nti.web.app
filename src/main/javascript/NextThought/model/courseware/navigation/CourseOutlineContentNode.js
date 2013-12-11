Ext.define('NextThought.model.courseware.navigation.CourseOutlineContentNode', {
	extend: 'NextThought.model.courseware.navigation.CourseOutlineNode',

	fields: [
		{name: 'AvailableBeginning', type: 'date', dateFormat: 'c'},
		{name: 'AvailableEnding', type: 'date', dateFormat: 'c'},
		{name: 'NTIID', type: 'string', mapping: 'ContentNTIID'}
	]
});
