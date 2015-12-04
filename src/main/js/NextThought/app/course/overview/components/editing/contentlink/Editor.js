Ext.define('NextThought.app.course.overview.components.editing.contentlink.Editor', {
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
						description: 'blah blah blah'
					},
					{
						title: 'Embed PDF',
						iconCls: 'pdf',
						type: 'internalpdf'
					},
					{
						title: 'Reading',
						iconCl: 'doc',
						type: 'reading'
					}
				]
			};
		}
	},

	requires: [
		'NextThought.app.course.overview.components.editing.contentlink.Preview',
		'NextThought.model.RelatedWork'
	],


	getFormSchema: function() {
		var schema = [
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


	addPreview: function(values) {
		return this.add({
			xtype: 'overview-editing-contentlink-preview',
			values: values
		});
	},


	getDefaultValues: function() {
		return this.record && this.record.isModel && this.record.getData();
	}
});
