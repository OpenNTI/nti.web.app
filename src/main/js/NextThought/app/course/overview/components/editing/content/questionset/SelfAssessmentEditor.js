Ext.define('NextThought.app.course.overview.components.editing.content.questionset.SelfAssessmentEditor', {
	extend: 'NextThought.app.course.overview.components.editing.content.questionset.AssignmentEditor',
	alias: 'widget.overview-editing-self-assessment-editor',

	requires: [
		'NextThought.model.QuestionSetRef'
	],


	addPreview: function(item) {
		var me = this,
			questions = item.get('questions'),
			questionCount = questions.length;

		me.add({
			xtype: 'box',
			autoEl: {
				cls: 'self-assessment-preview',
				cn: [
					{cls: 'title', html: item.get('title')},
					{cls: 'question-count', html: Ext.util.Format.plural(questionCount, 'Question')},
					{cls: 'remove'}
				]
			},
			listeners: {
				click: {
					element: 'el',
					fn: function(e) {
						if (e.getTarget('.remove')) {
							me.onChangeItem();
						}
					}
				}
			}
		});
	},


	getValues: function() {
		var item = this.selectedItem;

		return {
			MimeType: NextThought.model.QuestionSetRef.mimeType,
			label: item.get('title'),
			title: item.get('title'),
			'Target-NTIID': item.get('NTIID')
		};
	}
});
