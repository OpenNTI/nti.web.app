export default Ext.define('NextThought.app.course.overview.components.editing.outline.outlinenode.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.Editor',
	alias: 'widget.overview-editing-outlinenode-editor',

	requires: [
		'NextThought.model.courses.navigation.CourseOutlineNode',
		'NextThought.app.course.overview.components.editing.Actions',
		'NextThought.app.course.overview.components.editing.outline.outlinenode.ParentSelection'
	],

	cls: 'content-editor outline-editor',


	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.courses.navigation.CourseOutlineNode.mimeType
			];
		},


		getTypes: function() {
			return [
				{
					title: 'Unit',
					iconCls: 'unit',
					type: 'unit',
					description: 'A unit is good for...',
					editor: this
				}
			];
		}
	},


	FORM_SCHEMA: [
		{type: 'hidden', name: 'MimeType'},
		{type: 'text', name: 'title', placeholder: 'Title'}
	],

	getFormSchema: function() {
		var schema = [
				{name: 'MimeType', type: 'hidden'},
				{
					type: 'text',
					name: 'title',
					placeholder: 'Title',
					maxlength: NextThought.app.course.overview.components.editing.Actions.MAX_TITLE_LENGTH
				}
			];

		return schema;
	},



	getDefaultValues: function() {
		return {
			MimeType: NextThought.model.courses.navigation.CourseOutlineNode.mimeType,
			title: (this.record && this.record.getTitle()) || ''
		};
	},


	addParentSelection: function(record, parentRecord, rootRecord, onChange) {
		if (!rootRecord) { return null; }

		var items = rootRecord.get('Items'),
			bundle = this.bundle;

		return this.add(new NextThought.app.course.overview.components.editing.outline.outlinenode.ParentSelection({
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
