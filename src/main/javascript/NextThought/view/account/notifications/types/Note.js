Ext.define('NextThought.view.account.notifications.types.Note', {
	extend: 'NextThought.view.account.notifications.types.Base',
	alias: 'widget.notification-item-note',
	keyVal: 'application/vnd.nextthought.note',

	showCreator: true,
	wording: getString('NextThought.view.account.notifications.types.Note.wording'),
	previewField: 'preview',

	getWording: function(values) {
		if (values.inReplyTo || (values.references || []).length > 0) {
			return 'commented on a note.';
		}

		return 'shared a note.';
	},

	fillInData: function(rec) {
		this.callParent(arguments);

		if (!Ext.isEmpty(rec.get('location')) || !Ext.isEmpty(rec.get('path'))) {
			return;
		}

		LocationMeta.getMeta(rec.get('ContainerId'), function(meta) {
			var lineage = [],
				location = '';

			lineage = ContentUtils.getLineage((meta && meta.NTIID) || rec.get('ContainerId'), true);
			if (!Ext.isEmpty(lineage)) {
				location = lineage.shift();
				lineage.reverse();
			}

			rec.set({
				'location': Ext.String.ellipsis(location, 150, false),
				'path': lineage.join(' / ')//,
				//'textBodyContent': rec.getBodyText && rec.getBodyText()
			});
		});

		// rec.on("convertedToPlaceholder", function(){
		//	console.log("Item removed");
		//	this.destroy();
		// });
	}
});
