export default Ext.define('NextThought.app.notifications.components.Group', {
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
				var mimeType = cmp.mimeType;

				if (!Array.isArray(mimeType)) {
					mimeType = [mimeType];
				}

				mimeType.forEach(function(val) {
					if (val) {
						acc[val] = cmp;
					}
				});

				return acc;
			}, {});
		}
	},

	requires: [
		'NextThought.app.notifications.components.types.Badge',
		'NextThought.app.notifications.components.types.Base',
		'NextThought.app.notifications.components.types.BlogComment',
		'NextThought.app.notifications.components.types.BlogEntryPost',
		'NextThought.app.notifications.components.types.Contact',
		'NextThought.app.notifications.components.types.Feedback',
		'NextThought.app.notifications.components.types.ForumComment',
		'NextThought.app.notifications.components.types.ForumTopic',
		'NextThought.app.notifications.components.types.Grade',
		'NextThought.app.notifications.components.types.Note'
	],

	items: [],

	initComponent: function() {
		this.callParent(arguments);

		var groupLabel = this.group && Ext.data.Types.GROUPBYTIME.groupTitle(this.group, 'Today'),
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

		if (this.showLabel) {
			this.add({
				xtype: 'box',
				autoEl: {cls: 'group-header', html: groupLabel || ''}
			});
		}
	},


	unwrap: function(item) {
		return this.ISCHANGE.test(item.mimeType) ? item.getItem() : item;
	},


	addItem: function(item, prepend) {
		item = this.unwrap(item);

		var cmp = this.self.MIME_TO_COMPONENT[item.mimeType],
			config = {
				record: item,
				navigateToItem: this.navigateToItem.bind(this)
			};

		if (!cmp) {
			console.warn('No CMP for item: ', item);
			return;
		}

		if (prepend) {
			this.insert(1, cmp.create(config));
		} else {
			this.add(cmp.create(config));
		}
	},


	deleteRecord: function(record) {
		record = this.unwrap(record);

		var me = this;

		me.items.each(function(item) {
			if (item.record && item.record.getId() === record.getId()) {
				me.remove(item, true);
			}
		});
	}
});
