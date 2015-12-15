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

	cls: 'content-editor content-link url',


	afterRender: function() {
		this.callParent(arguments);

		this.formCmp.setPlaceholder('icon', NextThought.model.RelatedWork.getIconForURL());
	},


	getFormSchema: function() {
		var base = this.callParent(arguments);

		base.unshift({type: 'url', name: 'href', placeholder: 'Link', required: true});

		return base;
	}
});
