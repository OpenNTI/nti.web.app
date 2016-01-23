Ext.define('NextThought.app.course.overview.components.editing.content.questionset.AssignmentEditor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-assignment-editor',

	requires: [
		'NextThought.model.AssignmentRef'
	],


	showEditor: function() {
		this.parentSelection = this.addParentSelection(this.record, this.parentRecord, this.rootRecord, this.onFormChange.bind(this));

		if (this.selectedItem) {
			this.addPreview(this.selectedItem);
		}

		if (this.record) {
			this.deleteBtn = this.addDeleteButton();
		}
	},


	addPreview: function(item) {
		var me = this,
			now = new Date(),
			dueDate = item.getDueDate();

		me.add({
			xtype: 'box',
			autoEl: {
				cls: 'assignment-preview ' + (now < dueDate ? 'ontime' : 'overdue'),
				cn: [
					{cls: 'title', html: item.get('title')},
					{cls: 'due-date', html: Ext.Date.format(dueDate, 'l, F j, g:i a T')},
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
			MimeType: NextThought.model.AssignmentRef.mimeType,
			label: item.get('title'),
			title: item.get('title'),
			'Target-NTIID': item.get('NTIID')
		};

	},


	onSave: function() {
		var me = this,
			parentSelection = me.parentSelection,
			originalPosition = parentSelection && parentSelection.getOriginalPosition(),
			currentPosition = parentSelection && parentSelection.getCurrentPosition(),
			values = me.getValues();

		me.clearErrors();
		me.disableSubmission();

		return me.EditingActions.saveValues(values, me.record, originalPosition, currentPosition, me.rootRecord)
			.fail(function(reason) {
				me.enableSubmission();

				return Promise.reject(reason);
			});
	}
});
