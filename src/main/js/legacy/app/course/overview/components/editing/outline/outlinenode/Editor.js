var Ext = require('extjs');
var EditingEditor = require('../../Editor');
var NavigationCourseOutlineNode = require('../../../../../../../model/courses/navigation/CourseOutlineNode');
var EditingActions = require('../../Actions');
var OutlinenodeParentSelection = require('./ParentSelection');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.outline.outlinenode.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.Editor',
	alias: 'widget.overview-editing-outlinenode-editor',
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
					required: true,
					maxlength: NextThought.app.course.overview.components.editing.Actions.MAX_TITLE_LENGTH
				}
			];

		return schema;
	},

	getDefaultValues: function() {
		var types = this.self.getHandledMimeTypes();

		if (!types || types.length === 0) {
			console.warn('No default mime type');
			return;
		}

		if (types.length > 1) {
			console.warn('More than one default mime type, picking first: ', types);
		}

		return {
			MimeType: types[0],
			title: (this.record && this.record.getTitle()) || (this.getDefaultTitle && this.getDefaultTitle()) || ''
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
