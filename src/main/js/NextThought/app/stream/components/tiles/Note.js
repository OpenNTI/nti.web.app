Ext.define('NextThought.app.stream.components.tiles.Note', {
	extend: 'Ext.container.Container',

	layout: 'none',

	cls: 'item note',

	requires: [
		'NextThought.model.Note',
		'NextThought.app.stream.components.parts.BodyContent'
	],

	inheritableStatics: {
		mimeTypes: [NextThought.model.Note.mimeType]
	},


	initComponent: function() {
		this.callParent(arguments);

		this.add(Ext.widget('stream-parts-bodycontent', {
			Creator: this.record.get('Creator'),
			BodyContent: this.getBodyContent(),
			commentCount: this.record.get('ReplyCount'),
			title: this.record.get('title'),
			created: this.record.get('CreatedTime'),
			sharedWith: this.record.get('sharedWith'),
			replyable: !!this.record.getLink('add'),
			editable: !!this.record.getLink('editable'),
			reportable: !!this.record.getLink('flag'),
			deletable: !!this.record.getLink('editable'),
			record: this.record
		}));
	},


	getBodyContent: function() {
		var record = this.record;

		return new Promise(function(fulfill, reject) {
			record.compileBodyContent(function(html) {
				fulfill(html);
			});
		});
	}
});
