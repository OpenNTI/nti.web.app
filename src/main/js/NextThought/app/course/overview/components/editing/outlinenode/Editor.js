Ext.define('NextThought.app.course.overview.components.editing.outlinenode.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.Editor',
	alias: 'widget.overview-editing-outlinenode-editor',

	FORM_SCHEMA: [
		{type: 'text', name: 'title'}
	],


	getDefaultValues: function() {}
});
