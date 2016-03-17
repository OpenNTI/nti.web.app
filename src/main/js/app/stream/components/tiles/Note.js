export default Ext.define('NextThought.app.stream.components.tiles.Note', {
	extend: 'Ext.container.Container',

	layout: 'none',

	cls: 'item note',

	requires: [
		'NextThought.model.Note',
		'NextThought.app.stream.components.parts.BodyContent',
		'NextThought.app.stream.components.parts.AddComment',
		'NextThought.app.windows.Actions'
	],

	inheritableStatics: {
		mimeTypes: [NextThought.model.Note.mimeType]
	},


	initComponent: function() {
		this.callParent(arguments);

		this.WindowActions = NextThought.app.windows.Actions.create();

		this.add([
			Ext.widget('stream-parts-bodycontent', {
				Creator: this.record.get('Creator'),
				BodyContent: this.getBodyContent(),
				commentCount: this.record.get('ReplyCount'),
				title: this.record.get('title'),
				created: this.record.get('CreatedTime'),
				sharedWith: this.record.get('sharedWith'),
				replyable: true,
				editable: !!this.record.getLink('editable'),
				reportable: !!this.record.getLink('flag'),
				deletable: !!this.record.getLink('editable'),
				record: this.record,
				onShow: this.onShow.bind(this),
				onEdit: this.onEdit.bind(this),
				onAddComment: this.onAddComment.bind(this),
				onReport: this.onReport.bind(this),
				onDelete: this.onDelete.bind(this)
			})
			// Ext.widget('stream-parts-addcomment', {
			// 	onAddComment: this.onAddComment.bind(this)
			// })
		]);
	},


	getBodyContent: function() {
		var record = this.record;

		return new Promise(function(fulfill, reject) {
			record.compileBodyContent(function(html) {
				fulfill(html);
			});
		});
	},


	onShow: function() {
		this.WindowActions.pushWindow(this.record, null, this.el.dom);
	},


	onEdit: function() {},


	onAddComment: function() {
		this.WindowActions.pushWindow(this.record, 'reply', this.el.dom);
	},


	onReport: function() {},


	onDelete: function() {}
});
