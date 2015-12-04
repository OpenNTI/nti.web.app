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
						type: 'hyperlink'
					},
					{
						title: 'Internal PDF',
						iconCls: 'pdf',
						type: 'internaldoc'
					},
					{
						title: 'External Doc',
						iconCl: 'doc',
						type: 'externaldoc'
					}
				]
			};
		}
	},

	requires: [
		'NextThought.app.course.overview.components.editing.contentlink.Preview',
		'NextThought.model.RelatedWork'
	],


	FORM_SCHEMA: [
		{name: 'icon', displayName: 'Icon', type: 'file'},
		{name: 'label', displayName: 'Title', type: 'text', placeholder: 'Title....'},
		{name: 'byline', displayName: 'Author', type: 'text', placeholder: 'Author...'},
		{name: 'description', displayName: 'Description', type: 'textarea', placeholder: 'Description goes here...'}
	],


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
