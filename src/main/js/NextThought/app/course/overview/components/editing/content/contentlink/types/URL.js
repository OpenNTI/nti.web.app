Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.types.URL', {
	extend: 'NextThought.app.course.overview.components.editing.content.contentlink.types.Base',
	alias: 'widget.overview-editing-contentlink-url',

	statics: {
		getTypes: function() {
			return [
				{
					title: 'External Link',
					category: 'content',
					iconCls: 'link',
					description: 'External links are used for',
					editor: this
				}
			];
		}

		//TODO: override getEditorForRecord to check if the related work ref
		//is pointing to a url
	},


	getFormSchema: function() {
		var base = this.callParent(arguments);

		base.push({type: 'text', name: 'href', displayName: 'Link'});

		return base;
	}
});
