Ext.define('NextThought.app.course.overview.components.editing.content.questionset.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.EditorGroup',
	alias: 'widget.overview-editing-contentlink-editor',

	requires: [
		'NextThought.app.course.overview.components.editing.content.questionset.types.SelfAssessment',
		'NextThought.app.course.overview.components.editing.content.questionset.types.Assignment'
	],

	statics: {
		getSubEditors: function() {
			var base = NextThought.app.course.overview.components.editing.content.questionset.types;

			return [
				base.SelfAssessment,
				base.Assignment
			];
		}
	}

});
