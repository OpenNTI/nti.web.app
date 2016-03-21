Ext.define('NextThought.app.course.overview.components.editing.outline.contentnode.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.outline.calendarnode.Editor',
	alias: 'widget.overview-editing-contentnode-editor',

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineNode',
		'NextThought.app.course.overview.components.editing.outline.ParentSelection'
	],


	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.courses.navigation.CourseOutlineContentNode.mimeType
			];
		},

		getTypes: function() {
			return [
				{
					title: 'Lesson',
					iconCls: 'lesson',
					type: 'lesson',
					desciption: 'A Lesson is good for...',
					editor: this
				}
			];
		}
	},


	addParentSelection: function(record, parentRecord, rootRecord, onChange) {
		if (!rootRecord) { return null; }

		var items = rootRecord.get('Items');

		return this.add(new NextThought.app.course.overview.components.editing.outline.ParentSelection({
			selectionItems: items,
			selectedItem: parentRecord !== rootRecord ? parentRecord : null,
			parentRecord: parentRecord,
			rootRecord: rootRecord,
			editingRecord: record,
			scrollingParent: this.scrollingParent,
			onChange: onChange
		}));
	},


	getDefaultTitle: function() {
		var title = '';

		if (this.record && this.record.getTitle) {
			title = this.record.getTitle();
		} else if (this.parentRecord && this.parentRecord.getItemsCount) {
			title = 'Lesson ' + (this.parentRecord.getItemsCount() + 1);
		}

		return title;
	}
});
