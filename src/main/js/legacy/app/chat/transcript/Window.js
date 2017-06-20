const Ext = require('extjs');

const IdCache = require('legacy/cache/IdCache');
const UserRepository = require('legacy/cache/UserRepository');
const ParseUtils = require('legacy/util/Parsing');
const Transcript = require('legacy/model/Transcript');
const TranscriptSummary = require('legacy/model/TranscriptSummary');
const {isMe} = require('legacy/util/Globals');

const WindowsStateStore = require('../../windows/StateStore');
const WindowsActions = require('../../windows/Actions');
const ChatStateStore = require('../StateStore');

require('legacy/model/MessageInfo');
require('../../windows/components/Header');
require('../../windows/components/Loading');
require('../Gutter');
require('./Main');


module.exports = exports = Ext.define('NextThought.app.chat.transcript.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.chat-transcript-window',
	layout: 'none',
	autoScroll: true,
	cls: 'chat-window no-gutter chat-transcript-window scrollable',
	titleTpl: '{0} (Chat History)',

	initComponent: function () {
		this.callParent(arguments);
		this.WindowActions = WindowsActions.create();

		this.windowHeader = this.add({
			xtype: 'window-header',
			doClose: this.doClose.bind(this)
		});

		this.loadingCmp = this.add({xtype: 'window-loading'});

		if (this.record instanceof Transcript) {
			this.insertTranscript(this.record);
			this.remove(this.loadingCmp);
		} else {
			Service.request(this.record.getLink('transcript'))
				.then(function (value) {
					return ParseUtils.parseItems(value)[0];
				})
				.then(this.insertTranscript.bind(this))
				.then(this.remove.bind(this, this.loadingCmp));
		}
	},

	ui: 'chat-window',

	tools: {
		'flag-for-moderation': {
			tip: 'Report',
			handler: 'onFlagToolClicked'
		}
	},

	fixScroll: Ext.emptyFn,

	//don't "fixScroll" in chat windows.

	afterRender: function () {
		var btn;
		this.callParent(arguments);
		this.mon(this, 'control-clicked', this.maybeEnableButtons);
		btn = this.el.down('.flag-for-moderation');
		if (btn) {
			btn.show();
		}
	},

	maybeEnableButtons: function () {
		var b = this.down('[flagButton]');
		//if there is checked stuff down there, enable button
		if (this.el.down('.control.checked')) {
			b.setDisabled(false);
		}
		//if not, disable
		else {
			b.setDisabled(true);
		}
	},

	flagMessages: function () {
		var allFlaggedEntries = this.el.query('.message.flagged'),
			allFlaggedMessages = [],
			guid, m;

		Ext.each(allFlaggedEntries, function (e) {
			var arg = {};
			guid = e.getAttribute('data-guid');
			m = this.messageMap[guid];
			if (m) {
				arg.sender = e;
				arg.message = m;
				allFlaggedMessages.push(arg);
			}
		}, this);

		this.fireEvent('flag-messages', allFlaggedMessages, this);
	},

	onFlagToolClicked: function () {
		var transcriptViews = this.query('chat-transcript'),
			btn = this.el.down('.flag-for-moderation');

		this.el.toggleCls('moderating');
		Ext.each(transcriptViews, function (v) {
			v.toggleModerationPanel();
		});
		btn.toggleCls('moderating');

		//if we are now moderating, do something to the docked item
		if (btn.hasCls('moderating')) {
			this.down('[itemId=buttons]').show();
		}
		else {
			this.down('[itemId=buttons]').hide();
		}
	},

	clearFlagOptions: function () {
		var allFlaggedEntries = this.el.query('.message.flagged'),
			checked = this.el.query('.control.checked');
		Ext.each(allFlaggedEntries, function (f) {
			Ext.fly(f).toggleCls('flagged');
			if (!Ext.fly(f).hasCls('confirmFlagged')) {
				Ext.fly(f).toggleCls('confirmFlagged');
			}
		});
		Ext.each(checked, function (f) {
			Ext.fly(f).toggleCls('checked');
		});
		this.maybeEnableButtons();
	},

	failedToLoadTranscript: function () {
		alert({
			msg: 'There was an error loading chat history for:' + (this.errorMsgSupplement || ''),
			width: 450
		});
		this.destroy();
	},

	setTitleInfo: function (contributors) {
		var me = this;
		// list = me.down('chat-gutter');

		UserRepository.getUser(contributors, function (users) {
			var names = [];
			Ext.each(users, function (u) {
				if (!isMe(u)) {
					names.push(u.getName());
				}
			});

			// list.updateList(users);

			// me.windowHeader.setTitle(list.isHidden()
			//					? Ext.String.format(me.titleTpl, names.join(','))
			//					: 'Group Chat History');

			me.windowHeader.setTitle(Ext.String.format(me.titleTpl, names.join(',')));
		});
	},

	insertTranscript: function (record) {
		this.setTitleInfo(record.get('Contributors'));

		var time = record.get('RoomInfo').get('CreatedTime') || record.get('CreatedTime'),
			messages = record.get('Messages');

		//keep all messages for later flagging:
		if (!this.messageMap) {
			this.messageMap = {};
		}

		Ext.each(messages, function (m) {
			this.messageMap[IdCache.getIdentifier(m.getId())] = m;
		}, this);

		this.add({
			xtype: 'chat-transcript',
			time: time,
			messages: messages
		});
	}
}, function () {
	WindowsStateStore.register(TranscriptSummary.mimeType, this);
	WindowsStateStore.register(Transcript.mimeType, this);
	WindowsStateStore.registerCustomResolver(TranscriptSummary.mimeType, function (id) {
		var store = ChatStateStore.getInstance();

		id = store.getTranscriptIdForRoomInfo(id);
		id = id && id.toString();

		if (!id) {
			return Promise.reject();
		}

		return Service.getObject(id);
	});
});
