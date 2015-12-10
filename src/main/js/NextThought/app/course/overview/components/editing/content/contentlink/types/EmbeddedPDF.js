Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.types.EmbeddedPDF', {
	extend: 'NextThought.app.course.overview.components.editing.content.contentlink.types.Base',
	alias: 'widget.overview-editing-contentlink-embeddedpdf',


	statics: {
		getTypes: function() {
			return [
				{
					title: 'Embedded PDF',
					category: 'content',
					iconCls: 'embeddedpdf',
					description: 'Embeded PDFs are used for',
					editor: this
				}
			];
		}

		//TODO: override getEditorForRecord to check if the related work ref
		//is pointing to an embedded pdf
	},


	getFormSchema: function() {
		var base = this.callParent(arguments);

		base.push({type: 'file', name: 'href', displayName: 'PDF'});

		return base;
	}
});
