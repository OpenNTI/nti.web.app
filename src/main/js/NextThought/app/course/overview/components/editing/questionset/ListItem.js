Ext.define('NextThought.app.course.overview.components.editing.questionset.ListItem', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-questionset-listitem',

	mixins: {
		OrderingItem: 'NextThought.mixins.dnd.OrderingItem'
	},

	statics: {
		isAssessmentWidget: true,
		getSupported: function() {
			return [
				NextThought.model.QuestionSetRef.mimeType,
				NextThought.model.AssignmentRef.mimeType
			];
		}
	},

	requires: [
		'NextThought.app.course.overview.components.editing.questionset.Preview',
		'NextThought.model.QuestionSetRef',
		'NextThought.model.AssignmentRef'
	],


	layout: 'none',

	items: [
		{xtype: 'box', autoEl: {html: 'QuestionSet'}}
	]
});
