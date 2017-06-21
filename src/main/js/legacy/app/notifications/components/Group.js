const Ext = require('extjs');

const TypesBadge = require('./types/Badge');
const TypesBlogComment = require('./types/BlogComment');
const TypesBlogEntry = require('./types/BlogEntry');
const TypesBlogEntryPost = require('./types/BlogEntryPost');
const TypesContact = require('./types/Contact');
const TypesFeedback = require('./types/Feedback');
const TypesForumComment = require('./types/ForumComment');
const TypesForumTopic = require('./types/ForumTopic');
const TypesGrade = require('./types/Grade');
const TypesNote = require('./types/Note');


module.exports = exports = Ext.define('NextThought.app.notifications.components.Group', {
	extend: 'Ext.container.Container',
	alias: 'widget.notification-group',
	layout: 'none',
	cls: 'notification-group',
	ISCHANGE: /change$/,

	statics: {
		MIME_TO_COMPONENT: {},

		fillInMimeTypeComponent: function (cmps) {
			this.MIME_TO_COMPONENT = cmps.reduce(function (acc, cmp) {
				var mimeType = cmp.mimeType;

				if (!Array.isArray(mimeType)) {
					mimeType = [mimeType];
				}

				mimeType.forEach(function (val) {
					if (val) {
						acc[val] = cmp;
					}
				});

				return acc;
			}, {});
		}
	},

	items: [],

	initComponent: function () {
		this.callParent(arguments);

		var groupLabel = this.group && Ext.data.Types.GROUPBYTIME.groupTitle(this.group, 'Today');

		this.self.fillInMimeTypeComponent([
			TypesNote,
			TypesForumTopic,
			TypesBlogEntry,
			TypesGrade,
			TypesFeedback,
			TypesForumComment,
			TypesBlogComment,
			TypesBlogEntryPost,
			TypesContact,
			TypesBadge
		]);

		if (this.showLabel) {
			this.add({
				xtype: 'box',
				autoEl: {cls: 'group-header', html: groupLabel || ''}
			});
		}
	},

	unwrap: function (item) {
		return this.ISCHANGE.test(item.mimeType) ? item.getItem() : item;
	},

	addItem: function (item, prepend) {
		item = this.unwrap(item);

		const getCmp = (mimeType, cmpMap) => {
			const isValid = (element) => !!cmpMap[element];
			return Array.isArray(mimeType) ?
				cmpMap[mimeType.find(isValid)] :
				cmpMap[mimeType];
		};

		var cmp = getCmp(item.mimeType, this.self.MIME_TO_COMPONENT),
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

	deleteRecord: function (record) {
		record = this.unwrap(record);

		var me = this;

		me.items.each(function (item) {
			if (item.record && item.record.getId() === record.getId()) {
				me.remove(item, true);
			}
		});
	}
});
