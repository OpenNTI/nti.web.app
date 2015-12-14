Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.types.Doc', {
	extend: 'NextThought.app.course.overview.components.editing.content.contentlink.types.Base',
	alias: 'widget.overview-editing-contentlink-doc',


	statics: {
		getTypes: function() {
			return [
				{
					title: 'Document',
					category: 'content',
					iconCls: 'document',
					description: 'Documents are used for',
					editor: this
				}
			];
		}

		//TODO: override getEditorForRecord to check if the related work ref
		//is pointing to a doc
	},


	getFormSchema: function() {
		var base = this.callParent(arguments);

		base.unshift({type: 'file', name: 'href', displayName: 'Document'});

		return base;
	}
});
