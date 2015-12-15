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

	cls: 'content-editor content-link document',


	afterRender: function() {
		this.callParent(arguments);

		if (!this.record) {
			this.addCls('file-only');
		}
	},


	getFormSchema: function() {
		var base = this.callParent(arguments);

		//TODO: fill info about the existing file
		base.unshift({type: 'file', name: 'href', onFileAdded: this.onFileAdded.bind(this)});

		return base;
	},


	onFileAdded: function(type) {
		this.formCmp.setPlaceholder('icon', NextThought.model.RelatedWork.getIconForMimeType(type));
		this.removeCls('file-only');
	}
});
