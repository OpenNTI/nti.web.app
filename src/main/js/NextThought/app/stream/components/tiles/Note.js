Ext.define('NextThought.app.stream.components.tiles.Note', {
	extend: 'Ext.container.Container',

	requies: ['NextThought.model.Note'],

	inheritableStatics: {
		mimeTypes: [NextThought.model.Note.mimeType]
	},


	initComponent: function() {
		this.callParent(arguments);
	}
});
