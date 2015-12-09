Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.Editor',
	alias: 'widget.overview-editing-contentlink-editor',

	statics: {
		getTypes: function() {
			return {
				mimeType: NextThought.model.RelatedWork.mimeType,
				types: [
					{
						title: 'External Link',
						iconCls: 'link',
						type: 'hyperlink',
						description: 'External Links are used for'
					},
					{
						title: 'Embed PDF',
						iconCls: 'pdf',
						type: 'internalpdf',
						description: 'Embeded PDFs are used for'
					},
					{
						title: 'Reading',
						iconCl: 'doc',
						type: 'reading',
						description: 'Readings are used for'
					}
				]
			};
		}
	},

	requires: [
		'NextThought.model.RelatedWork',
		'NextThought.app.course.overview.components.editing.content.ParentSelection'
	],


	getFormSchema: function() {
		var schema = [
				{name: 'MimeType', type: 'hidden'},
				{name: 'icon', displayName: 'Icon', type: 'file'},
				{name: 'label', displayName: 'Title', type: 'text', placeholder: 'Title....'},
				{name: 'byline', displayName: 'Author', type: 'text', placeholder: 'Author...'},
				{name: 'description', displayName: 'Description', type: 'textarea', placeholder: 'Description goes here...'}
			];

		if (this.type === 'hyperlink') {
			schema.push({name: 'href', displayName: 'Link', type: 'text', placeholder: 'Link...'});
		} else if (this.type === 'internalpdf') {
			schema.push({name: 'href', displayName: 'PDF', type: 'file'});
		} else if (this.type === 'reading') {
			schema.push({name: 'href', displayName: 'Reading', type: 'text', placeholder: 'Reading...'});
		}

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
