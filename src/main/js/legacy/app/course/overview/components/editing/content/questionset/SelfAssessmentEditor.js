var Ext = require('extjs');
var QuestionsetAssignmentEditor = require('./AssignmentEditor');
var ModelQuestionSetRef = require('../../../../../../../model/QuestionSetRef');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.questionset.SelfAssessmentEditor', {
	extend: 'NextThought.app.course.overview.components.editing.content.questionset.AssignmentEditor',
	alias: 'widget.overview-editing-self-assessment-editor',

	addPreview: function (item) {
		var me = this,
			questions = item.get('questions'),
			questionCount = questions.length,
			parts = [
				{cls: 'title', html: item.get('title')},
				{cls: 'question-count', html: Ext.util.Format.plural(questionCount, 'Question')}
			];

		if (Service.canDoAdvancedEditing()) {
			parts.push({cls: 'remove'});
		}

		me.add({
			xtype: 'box',
			autoEl: {
				cls: 'self-assessment-preview',
				cn: parts
			},
			listeners: {
				click: {
					element: 'el',
					fn: function (e) {
						if (e.getTarget('.remove')) {
							me.onChangeItem();
						}
					}
				}
			}
		});
	},

	getValues: function () {
		var item = this.selectedItem;

		return {
			MimeType: NextThought.model.QuestionSetRef.mimeType,
			label: item.get('title'),
			title: item.get('title'),
			'Target-NTIID': item.get('NTIID')
		};
	},

	hasRecordChanged: function (values) {
		var changed = false;

		if (!this.record) {
			changed = true;
		} else if (this.record.get('label') !== values.label) {
			changed = true;
		} else if (this.record.get('Target-NTIID') !== values['Target-NTIID']) {
			changed = true;
		}

		return changed;
	}
});
