var Ext = require('extjs');
var QuestionsetAssignmentEditor = require('../questionset/AssignmentEditor');
var ModelSurveyRef = require('../../../../../../../model/SurveyRef');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.survey.SurveyEditor', {
	extend: 'NextThought.app.course.overview.components.editing.content.questionset.AssignmentEditor',
	alias: 'widget.overview-editing-survey-editor',

	addPreview: function (item) {
		var me = this,
			questions = item.get('questions'),
			questionCount = questions.length,
			parts = [
				{cls: 'title', html: item.get('title')},
				{cls: 'question-count', html: Ext.util.Format.plural(questionCount, 'Question')}
			];

		parts.push({cls: 'remove'});

		me.add({
			xtype: 'box',
			autoEl: {
				cls: 'survey-preview',
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
			MimeType: NextThought.model.SurveyRef.mimeType,
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
