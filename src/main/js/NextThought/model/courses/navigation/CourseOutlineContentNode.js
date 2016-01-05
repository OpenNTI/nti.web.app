Ext.define('NextThought.model.courses.navigation.CourseOutlineContentNode', {
	extend: 'NextThought.model.courses.navigation.CourseOutlineNode',
	mimeType: 'application/vnd.nextthought.courses.courseoutlinecontentnode',

	fields: [
		{name: 'publishBeginning', type: 'auto'},
		{name: 'publishEnding', type: 'number'},
		{name: 'PublicationState', type: 'string'}
	],

	statics: {
		mimeType: 'application/vnd.nextthought.courses.courseoutlinecontentnode'
	},


	getFirstContentNode: function() {
		return this.isPublished() && this.get('isAvailable') ? this : null;
	},


	isPublished: function() {
		var state = this.get('PublicationState') || '';

		return state.toLowerCase() === ('DefaultPublished').toLowerCase();
	}
});
