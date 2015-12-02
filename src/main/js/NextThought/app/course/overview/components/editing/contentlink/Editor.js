Ext.define('NextThought.app.course.overview.components.editing.contentlink.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.Editor',
	alias: 'widget.overview-editing-contentlink-editor',

	requires: [
		'NextThought.app.course.overview.components.editing.contentlink.Preview'
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
