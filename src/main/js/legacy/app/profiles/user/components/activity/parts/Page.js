var Ext = require('extjs');
var EventsActivityItem = require('./events/ActivityItem');
var EventsActivityItemReply = require('./events/ActivityItemReply');
var EventsBadge = require('./events/Badge');
var EventsBlogged = require('./events/Blogged');
var EventsBlogReply = require('./events/BlogReply');
var EventsForumActivityItem = require('./events/ForumActivityItem');
var EventsHighlightContainer = require('./events/HighlightContainer');
var EventsJoined = require('./events/Joined');
var EventsNoteReply = require('./events/NoteReply');
var EventsPostReply = require('./events/PostReply');
var EventsTopicReply = require('./events/TopicReply');
var EventsTranscriptSummaryItem = require('./events/TranscriptSummaryItem');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.activity.parts.Page', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-stream-page',
	layout: 'none',
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		this.add(this.cmpsFromRecords(this.records));
	},

	onAdd: function (cmp) {
		this.callParent(arguments);
		cmp.addCls('activity-event-item');
	},

	cmpsFromRecords: function (records) {
		var me = this,
			cmps = [], lastHighlightContainer, user = me.user;

		function getDate (rec) {
			var d = rec.get('CreatedTime') || new Date(0);
			return new Date(
					d.getFullYear(),
					d.getMonth(),
					d.getDate());
		}

		function newContainer (rec) {
			lastHighlightContainer = {
				xtype: 'profile-activity-highlight-container',
				date: getDate(rec),
				user: user,
				items: [rec],
				navigateToObject: me.navigateToObject.bind(me)
			};
			cmps.push(lastHighlightContainer);
		}

		(records || []).forEach(function (i) {
			if (/change$/.test(i.get('MimeType'))) {
				i = i.getItem();
			}

			//if we don't have a record don't try to make a component for it
			if (!i) { return; }

			var c = (i.get('Class') || 'default').toLowerCase(),
				reply = (i.isTopLevel && !i.isTopLevel() && '-reply') || '',
				n = 'profile-activity-' + c + reply + '-item',
				alias = 'widget.' + n;

			if (c === 'highlight') {
				//This may simplify to line-item-like activity items in the future
				if (lastHighlightContainer && lastHighlightContainer.date.getTime() === getDate(i).getTime()) {
					lastHighlightContainer.items.push(i);
				}
				else {
					newContainer(i);
				}
				return;
			}

			if (Ext.isEmpty(Ext.ClassManager.getNameByAlias(alias), false)) {
				console.error('Unsupported type: ', n, ' record: ', i, ', skipping');
				return;
			}

			cmps.push({record: i, root: true, user: user, xtype: n, navigateToObject: me.navigateToObject.bind(me)});
		});

		return cmps;
	}
});
