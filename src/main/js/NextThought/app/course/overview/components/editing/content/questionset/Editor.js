Ext.define('NextThought.app.course.overview.components.editing.content.questionset.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-questionset',

	requires: [
		'NextThought.model.QuestionSetRef',
		'NextThought.model.AssignmentRef'
	],

	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.QuestionSetRef.mimeType,
				NextThought.model.AssignmentRef.mimeType
			];
		}
	},

	addFormCmp: function() {}
});
