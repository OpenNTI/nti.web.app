Ext.define('NextThought.view.account.notifications.types.Note', {
	extend: 'NextThought.view.account.notifications.types.Base',
	alias: 'widget.notification-item-note',
	keyVal: 'application/vnd.nextthought.note',

	showCreator: true,
	verb: 'shared a note',
	previewField: 'preview',

	getVerb: function(values) {
		if (values.inReplyTo) {
			return 'commented';
		}

		return 'shared a note';
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
