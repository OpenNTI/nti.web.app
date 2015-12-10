Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.types.Reading', {
	extend: 'NextThought.app.course.overview.components.editing.content.contentlink.types.Base',
	alias: 'widget.overview-editing-contentlink-reading',


	statics: {
		getTypes: function() {
			return [
				{
					title: 'Reading',
					category: 'content',
					iconCls: 'reading',
					description: 'Readings are used for',
					editor: this
				}
			];
		}

		//TODO: override getEditorForRecord to check if the related work ref
		//is pointing to a reading
	}
});
