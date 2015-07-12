Ext.define('NextThought.app.chat.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.chats-view',

	layout: 'none',

	cls: 'chat-container',

	requires: [
		'NextThought.app.chat.StateStore',
		'NextThought.app.chat.Actions',
		'NextThought.app.chat.Gutter',
		'NextThought.app.chat.transcript.Window',
		'NextThought.app.chat.components.Window'
	],

	items: [],


	renderTpl: Ext.DomHelper.markup([
		{cls: 'gutter'},
		{id: '{id}-body', cn: ['{%this.renderContainer(out, values)%}']}
	]),


	getTargetEl: function() { return this.body; },
	childEls: ['body'],

	renderSelectors: {
		gutter: '.gutter'
	},

	CHAT_WIN_MAP: {},


	initComponent: function() {
		this.callParent(arguments);

		this.ChatStore = NextThought.app.chat.StateStore.getInstance();
		this.ChatActions = NextThought.app.chat.Actions.create();
		this.GroupStore = NextThought.app.groups.StateStore.getInstance();

		this.mon(this.ChatStore, {
			'show-window': this.showChatWindow.bind(this),
			'show-whiteboard': this.showWhiteboard.bind(this),
			'chat-notification-toast': this.handleNonContactNotification.bind(this)
		});
	},


	afterRender: function() {
		this.callParent(arguments);
		this.gutterWin = Ext.widget('chat-gutter-window', {renderTo: this.gutter, autoShow: true});
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


	handleNonContactNotification: function (win, msg) {
		var me = this,
			roomInfo = win && win.roomInfo;

		if (!win || !roomInfo) { return; }

		// Handle chat notification
		console.log('Cannot add chat notification: ', msg);
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
				me.ChatActions.postMessage(room, [wbData], mid, channel, recipients, Ext.bind(me.sendAckHandler, me));
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
