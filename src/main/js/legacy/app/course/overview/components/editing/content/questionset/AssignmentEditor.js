const Ext = require('extjs');

const AssignmentRef = require('legacy/model/AssignmentRef');

require('../Editor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.questionset.AssignmentEditor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-assignment-editor',

	showEditor: function () {
		this.parentSelection = this.addParentSelection(this.record, this.parentRecord, this.rootRecord, this.onFormChange.bind(this));

		if (this.selectedItem) {
			this.addPreview(this.selectedItem);
		}

		if (this.record) {
			this.deleteBtn = this.addDeleteButton();
		}
	},

	addPreview: function (item) {
		var me = this,
			now = new Date(),
			dueDate = item.getDueDate(),
			parts = [
				{cls: 'title', html: item.get('title')},
				{cls: 'due-date', html: Ext.Date.format(dueDate, 'l, F j, g:i a T')}
			];

		parts.push({cls: 'remove'});

		me.add({
			xtype: 'box',
			autoEl: {
				cls: 'assignment-preview ' + (now < dueDate ? 'ontime' : 'overdue'),
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
			MimeType: AssignmentRef.mimeType,
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
		} else if (this.record.get('title') !== values.title) {
			changed = true;
		} else if (this.record.get('Target-NTIID') !== values['Target-NTIID']) {
			changed = true;
		}

		return changed;
	},

	onSave: function () {
		var me = this,
			parentSelection = me.parentSelection,
			originalPosition = parentSelection && parentSelection.getOriginalPosition(),
			currentPosition = parentSelection && parentSelection.getCurrentPosition(),
			values = me.getValues();

		me.clearErrors();
		me.disableSubmission();

		if (!this.hasRecordChanged(values)) {
			values = null;
		}

		return me.EditingActions.saveValues(values, me.record, originalPosition, currentPosition, me.rootRecord)
			.catch(function (reason) {
				me.enableSubmission();

				return Promise.reject(reason);
			});
	}
});
