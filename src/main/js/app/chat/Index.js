var Ext = require('extjs');
var User = require('../../model/User');
var ChatStateStore = require('./StateStore');
var ChatActions = require('./Actions');
var ChatGutter = require('./Gutter');
var TranscriptWindow = require('./transcript/Window');
var ComponentsWindow = require('./components/Window');
var GutterList = require('./components/gutter/List');
var NavigationStateStore = require('../navigation/StateStore');


module.exports = exports = Ext.define('NextThought.app.chat.Index', {
    extend: 'Ext.container.Container',
    alias: 'widget.chats-view',
    layout: 'none',
    cls: 'chat-container',
    items: [],

    statics: {
		// show the notification tab if the vp is less than this threshold.
		MIN_VIEWPORT_WIDTH: 1180
	},

    renderTpl: Ext.DomHelper.markup([
		{cls: 'gutter'},
		{cls: 'gutter-list'},
		{id: '{id}-body', cn: ['{%this.renderContainer(out, values)%}']}
	]),

    getTargetEl: function() { return this.body; },
    childEls: ['body'],

    renderSelectors: {
		gutter: '.gutter',
		listEl: '.gutter-list'
	},

    CHAT_WIN_MAP: {},

    initComponent: function() {
		this.callParent(arguments);

		this.ChatStore = NextThought.app.chat.StateStore.getInstance();
		this.ChatActions = NextThought.app.chat.Actions.create();
		this.GroupStore = NextThought.app.groups.StateStore.getInstance();
		this.NavigationStore = NextThought.app.navigation.StateStore.getInstance();

		this.mon(this.ChatStore, {
			'show-window': this.showChatWindow.bind(this),
			'show-whiteboard': this.showWhiteboard.bind(this),
			'notify': this.handleTabNotifications.bind(this),
			'show-all-gutter-contacts': this.showAllOnlineContacts.bind(this),
			'hide-all-gutter-contacts': this.hideAllOnlineContacts.bind(this),
			'toggle-gutter': this.toggleGutter.bind(this)
		});
	},

    afterRender: function() {
		this.callParent(arguments);
		this.gutterWin = Ext.widget('chat-gutter-window', {renderTo: this.gutter, autoShow: true});
	},

    showAllOnlineContacts: function(gutter) {
		var me = this;
		if (!this.listWin) {
			this.listWin = Ext.widget('chat-gutter-list-view', {
				store: gutter && gutter.store,
				renderTo: this.listEl,
				openChatWindow: gutter.openChatWindow.bind(gutter),
				selectActiveUser: gutter.selectActiveUser.bind(gutter),
				gutter: gutter
			});

			gutter.gutterList = this.listWin;
		}

		this.addCls('show-all');
	},

    hideAllOnlineContacts: function() {
		var me = this;

		this.removeCls('show-all');
		Ext.each(this.ChatStore.getAllChatWindows(), function(win) {
			if (me.gutterWin && me.gutterWin.adjustToExpandedChat && win.isVisible()) {
				me.gutterWin.adjustToExpandedChat(win);
			}
		});
	},

    showChatWindow: function(roomInfo) {
		var w;

		this.ChatActions.onEnteredRoom(roomInfo);
		w = this.ChatStore.getChatWindow(roomInfo);
		if (w && this.ChatActions.canShowChat(roomInfo)) {
			w.notify();
			w.show();
		}
	},

    toggleGutter: function() {
		var active = this.hasCls('show-gutter');

		if (active) {
			this.ChatStore.fireEvent('gutter-deactive');
			this.removeCls('show-gutter');
		} else {
			this.ChatStore.fireEvent('gutter-active');
			this.addCls('show-gutter');
		}
	},

    shouldHaveChatTab: function() {
		var viewportWidth = Ext.Element.getViewportWidth();
		// We would like to hide the gutter if the window is too small.
		return viewportWidth <= NextThought.app.chat.Index.MIN_VIEWPORT_WIDTH;
	},

    handleTabNotifications: function(win, msg) {
		if (win && win.isVisible() ||
			this.gutterWin && this.gutterWin.el && this.gutterWin.el.isVisible() ||
			this.listWin && this.listWin.el && this.listWin.el.isVisible()) {
			return;
		}

		var showTab = this.shouldHaveChatTab();
		if (showTab) {
			this.NavigationStore.fireChatNotification(msg);
		}
	},

    createWhiteBoard: function(data, ownerCmp, chatStatusEvent) {
		var win = Ext.widget('wb-window', {
			width: 802,
			value: data,
			chatStatusEvent: chatStatusEvent,
			ownerCmp: ownerCmp
		});

		return win;
	},

    showWhiteboard: function(data, cmp, mid, channel, recipients) {
		var me = this,
			room = this.ChatActions.getRoomInfoFromComponent(cmp),
			wbWin = this.createWhiteBoard(data, cmp, 'status-change'),
			wbData,
			scrollEl = cmp.up('.chat-view').el.down('.chat-log-view'),
			scrollTop = scrollEl.getScroll().top;

		//hook into the window's save and cancel operations:
		wbWin.on({
			save: function(win, wb) {
				wbData = wb.getValue();
				me.ChatActions.clearErrorForRoom(room);
				me.ChatActions.postMessage(room, [wbData], mid, channel, recipients, Ext.bind(me.ChatActions.sendAckHandler, me.ChatActions));
				wbWin.close();
			},
			cancel: function() {
				//if we haven't added the wb to the editor, then clean up, otherwise let the window handle it.
				wbWin.close();
				if (scrollEl.getScroll().top === 0) {
					scrollEl.scrollTo('top', scrollTop);
				}
			}
		});

		//show window:
		wbWin.show();
	}
});
