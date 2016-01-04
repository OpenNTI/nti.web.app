Ext.define('NextThought.app.course.overview.components.editing.content.overviewgroup.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.Editor',
	alias: 'widget.overview-editing-overviewgroup-editor',

	requires: [
		'NextThought.model.courses.overview.Group',
		'NextThought.app.course.overview.components.editing.content.overviewgroup.ParentSelection',
		'NextThought.app.course.overview.components.editing.content.overviewgroup.InlineEditor'
	],


	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.courses.overview.Group.mimeType
			];
		},


		getTypes: function() {
			return [
				{
					title: 'Group',
					category: 'content',
					iconCls: 'group',
					description: 'Groups are used for',
					editor: this
				}
			];
		}
	},


	addFormCmp: function() {
		return this.add({
			xtype: 'overview-editing-overviewgroup-inlineeditor',
			record: this.record,
			onChange: this.onFormChange.bind(this)
		});
	},


	onSave: function() {
		var me = this,
			parentSelection = me.parentSelection,
			originalPosition = parentSelection && parentSelection.getOriginalPosition(),
			currentPosition = parentSelection && parentSelection.getCurrentPosition();

		me.disableSubmission();

		return me.EditingActions.saveValues(me.formCmp.getValue(), me.record, originalPosition, currentPosition, me.rootRecord)
			.fail(function(reason) {
				me.enableSubmission();

				return Promise.reject(reason);
			});
	},


	addParentSelection: function(record, parentRecord, rootRecord, onChange) {
		if (!rootRecord) { return null; }

		var items = rootRecord.get('Items');

		return this.add(new NextThought.app.course.overview.components.editing.content.overviewgroup.ParentSelection({
			selectionItems: [rootRecord],
			selectedItem: rootRecord,
			parentRecord: parentRecord,
			rootRecord: rootRecord,
			editingRecord: record,
			scrollingParent: this.scrollingParent,
			onChange: onChange
		}));
	}
});
