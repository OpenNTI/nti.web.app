Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.types.Base', {
	extend: 'NextThought.app.course.overview.components.editing.Editor',

	requires: [
		'NextThought.model.RelatedWork',
		'NextThought.app.course.overview.components.editing.content.ParentSelection'
	],


	inheritableStatics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.RelatedWork.mimeType
			];
		}
	},


	getFormSchema: function() {
		var schema = [
				{name: 'MimeType', type: 'hidden'},
				{type: 'group', name: 'card', inputs: [
					{name: 'icon', displayName: 'Icon', type: 'file'},
					{name: 'label', displayName: 'Title', type: 'text', placeholder: 'Title....'},
					{name: 'byline', displayName: 'Author', type: 'text', placeholder: 'Author...'},
					{name: 'description', displayName: 'Description', type: 'textarea', placeholder: 'Description goes here...'}
				]}
			];

		return schema;
	},


	getDefaultValues: function() {
		if (this.record) {
			return this.record.isModel && this.record.getData();
		}

		return {
			MimeType: NextThought.model.RelatedWork.mimeType
		};
	},


	addParentSelection: function(record, parentRecord, rootRecord) {
		if (!rootRecord) { return null; }

		var items = rootRecord.get('Items');

		return this.add(new NextThought.app.course.overview.components.editing.content.ParentSelection({
			selectionItems: items,
			selectedItem: parentRecord !== rootRecord ? parentRecord : null,
			parentRecord: parentRecord,
			rootRecord: rootRecord,
			editingRecord: record,
			scrollingParent: this.scrollingParent
		}));
	}
});
