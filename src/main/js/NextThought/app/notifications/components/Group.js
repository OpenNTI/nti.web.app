Ext.define('NextThought.app.notifications.components.Group', {
	extend: 'Ext.container.Container',
	alias: 'widget.notification-group',

	layout: 'none',

	cls: 'notification-group',

	ISCHANGE: /change$/,

	statics: {
		MIME_TO_COMPONENT: {},

		fillInMimeTypeComponent: function(cmps) {
			var map = {};

			this.MIME_TO_COMPONENT = cmps.reduce(function(acc, cmp) {
				var keyVal = cmp.keyVal;

				if (!Array.isArray(keyVal)) {
					keyVal = [keyVal];
				}

				keyVal.forEach(function(val) {
					if (val) {
						acc[val] = cmp;
					}
				});

				return acc;
			}, {});
		}
	},

	requires: [
		'NextThought.app.notifications.components.types.*'
	],

	items: [],

	initComponent: function() {
		this.callParent(arguments);

		var groupLabel = this.group && Ext.data.Types.GROUPBYTIME.groupTitle(this.group),
			Types = NextThought.app.notifications.components.types;

		this.self.fillInMimeTypeComponent([
			Types.Note,
			Types.ForumTopic,
			Types.BlogEntry,
			Types.Grade,
			Types.Feedback,
			Types.ForumComment,
			Types.BlogComment,
			Types.BlogEntryPost,
			Types.Contact,
			Types.Badge
		]);

		this.add({
			xtype: 'box',
			autoEl: {cls: 'group-header', html: groupLabel || ''}
		});
	},


	addItem: function(item, prepend) {
		item = this.ISCHANGE.test(item.mimeType) ? item.getItem() : item;

		var cmp = this.self.MIME_TO_COMPONENT[item.mimeType],
			config = {item: item};

		if (prepend) {
			this.insert(1, cmp.create(config));
		} else {
			this.add(cmp.create(config));
		}
	}
});
