Ext.define('NextThought.app.chat.components.Log', {
	extend: 'Ext.container.Container',
	alias: 'widget.chat-log-view',
	requires: [
		'NextThought.model.MessageInfo',
		'NextThought.app.chat.components.log.Entry',
		'NextThought.app.chat.components.log.NotificationEntry',
		'NextThought.app.chat.components.log.NotificationStatus',
		'NextThought.app.chat.components.log.Moderated',
		'NextThought.app.chat.components.log.Content',
		'NextThought.app.chat.components.log.Info',
		'NextThought.cache.IdCache'
	],

	cls: 'chat-log-view',
	overflowX: 'hidden',
	overflowY: 'auto',
	layout: {
		type: 'auto',
		reserveScrollbar: false
	},
	defaults: {border: false},


	getMessageQuery: function(id) {
		return Ext.String.format('{0}[messageId={1}]', this.entryType, IdCache.getIdentifier(id));
	},


	initComponent: function() {

		this.entryType = this.entryType || 'chat-log-entry';
		this.moderated = !!this.moderated;
		// if (this.moderated) {
		//    this.entryType += '-moderated';

		//    this.tools = [
		// 				{
		// 					type: 'gear',
		// 					tooltip: getString('NextThought.view.chat.Log.select-all-tooltip'),
		// 					action: 'selectall'
		// 				},
		// 				{
		// 					type: 'help',
		// 					tooltip: getString('NextThought.view.chat.Log.select-none-tooltip'),
		// 					action: 'selectnone'
		// 				},
		// 				{
		// 					type: 'next',
		// 					tooltip: getString('NextThought.view.chat.Log.approve-tooltip'),
		// 					action: 'approve'
		// 				},
		// 				{
		// 					type: 'prev',
		// 					tooltip: getString('NextThought.view.chat.Log.reject-tooltip'),
		// 					action: 'reject'
		// 				}
		// 			];
		// 	this.dockedItems = {
		// 	   xtype: 'toolbar',
		// 	   dock: 'bottom',
		// 	   items: [
		// 		   {
		// 			   text: getString('NextThought.view.chat.Log.select-all'),
		// 			   action: 'selectall'
		// 		   },
		// 		   {
		// 			   text: getString('NextThought.view.chat.Log.select-none'),
		// 			   action: 'selectnone'},
		// 		   {
		// 			   text: getString('NextThought.view.chat.Log.approve'),
		// 			   action: 'approve'},
		// 		   {
		// 			   text: getString('NextThought.view.chat.Log.reject'),
		// 			   action: 'reject'}
		// 	   ]
		// 	};
		// }

		this.addEvents({ 'status-change': true });
		this.enableBubble(['status-change']);
		this.shouldAllowScrollingOnAdd = true;
		this.callParent(arguments);
	},


	afterRender: function() {
		this.callParent(arguments);
		this.mon(this.el, { scroll: this.onScroll, scope: this });
		this.previousScroll = 0;
	},


	onScroll: function() {
		var me = this, scrollVal = Math.abs(me.el.dom.scrollHeight - me.el.dom.scrollTop - me.el.dom.offsetHeight),
			minOffset = 50;

		if ((me.previousScroll > me.el.dom.scrollTop) && scrollVal > minOffset) {
			this.shouldAllowScrollingOnAdd = false;
		}
		else if (!this.shouldAllowScrollingOnAdd && scrollVal < minOffset) {
			this.shouldAllowScrollingOnAdd = true;
		}

		// Set the new scrolling.
		me.previousScroll = me.el.dom.scrollTop;
	},


	selectall: function() {
		Ext.each(this.query(this.entryType), function(f) {
			f.setValue(true);
		});
	},


	selectnone: function() {
		Ext.each(this.query(this.entryType), function(f) {
			f.setValue(false);
		});
	},


	approve: function() {
		var a = [];

		Ext.each(this.query(this.entryType), function(f) {
			if (f.getValue()) {
				a.push(f.message.get('ID'));
			}
		}, this);

		this.fireEvent('approve', a);
	},


	reject: function() {
		Ext.each(this.query(this.entryType), function(f) {
			if (f.getValue()) {this.remove(f); }
		}, this);
	},


	removeMessage: function(msg) {
		var c, m = this.down(this.getMessageQuery(msg.getId()));
		if (m) {
			c = m.ownerCt;
			c.remove(m);
			if (c.xtype !== 'chat-log-view' && c.items.getCount() === 0) {c.destroy();}
		}

	},


	addContentMessage: function(msg) {
		this.add({
			xtype: 'chat-content-log-entry',
			message: msg
		});
	},


	insertTranscript: function(m) {
		var messages = m.get('Messages');
		messages.sort(Globals.SortModelsBy('Last Modified', null, null));
		Ext.each(messages, function(msg) {
			this.addMessage(msg);
		}, this);
	},


	failedToLoadTranscript: function() {
		console.error('failed to load transcript', arguments);
	},


	addMessage: function(msg) {
		var id = msg.getId(),
			rid = msg.get('inReplyTo'),
			m = id ? this.down(this.getMessageQuery(id)) : null,
			mStat = msg.get('Status'),
			me = this, o, img;
		if (!id) {console.warn('This message has no NTIID, cannot be targeted!', msg);}

		this.clearChatStatusNotifications();
		if (m) {
			m.update(msg);
			return;
		}

		//m is what we want to add too. It's either the root container (this) or its the replied-to-entry.
		m = this;

		if (rid) {
			m = this.down(this.getMessageQuery(rid));
			if (!m) {
				//create place holder, reassign m the ref to place holder
				m = this.add({
					xtype: this.entryType,
					message: new NextThought.model.MessageInfo(),
					messageId: IdCache.getIdentifier(rid)
				});
			}
		}

		if (mStat === 'st_SHADOWED') {
			//this is a shadowed message, make sure to add a class to it
			m.addCls('shadowed');
		}

		this.shouldAddTimestampBeforeMessage(msg);

		o = m.add({
			xtype: this.entryType,
			message: msg,
			messageId: IdCache.getIdentifier(msg.getId())
		});

		// Scroll the chat log down after adding the element
		// and after any images load
		function scrollChatLog() {
			if (o.el && me.el && me.shouldAllowScrollingOnAdd) {
				me.el.scroll('down', Infinity);
			}
		}

		img = o.el && o.el.select('.body-text img');
		if (img && img.getCount() >= 1) {
			img.on('load', scrollChatLog);
		}
		scrollChatLog();
	},


	prepareMessagesBeforeAdd: function(messages) {
		var m = [], me = this, lastTimeStamp, lastItem;

		

		(messages || []).forEach(function(msg) {
			var newMsgTime = msg.get('CreatedTime'),
				stamp = Ext.Date.format(newMsgTime, 'F j, Y, g:i a'),
				intervalTimeStamp;

			if (lastTimeStamp) {
				// Check if the incoming message is within 5 mins from the previous message. If not, print the last timestamp.
				// Time interval is arbitrary; we can make it whatever we want.
				intervalTimeStamp = Ext.Date.add(lastTimeStamp, Ext.Date.MINUTE, 5);
				if (!Ext.Date.between(newMsgTime, lastTimeStamp, intervalTimeStamp)) {
					m.push({
						xtype: 'chat-notification-entry',
						message: stamp
					});
				}
			}
			else {
				m.push({
					xtype: 'chat-notification-entry',
					message: stamp
				});
			}

			m.push({
				xtype: me.entryType,
				message: msg,
				messageId: IdCache.getIdentifier(msg.getId())
			});

			lastTimeStamp = newMsgTime;
		});

		return m;
	},


	addBulkMessages: function(messages) {
		var m, win, lastItem, me = this;

		function scroll() {
			if (lastItem && lastItem.el) {
				lastItem.el.scrollIntoView(me.el);
			}
		}

		m = this.prepareMessagesBeforeAdd(messages) || [];
		if (!Ext.isEmpty(m)) {
			this.add(m);
		}

		// Scroll to the last item.
		lastItem = me.items.items.last();
		win = this.up('window');
		if (win) {
			if (win.isVisible()) {
				wait().then(scroll);
			}
			else {
				win.on('show', scroll);
			}
		}
	},


	insertBulkMessages: function(index, messages) {
		var m = this.prepareMessagesBeforeAdd(messages) || [],
			lastItem, me = this, lastIndex;
		if (!Ext.isEmpty(m)) {
			this.insert(index, m);
			lastIndex = m.length;

			// Wait is needed to make sure we account
			// for whether the load more history button is added or not.
			wait(10)
				.then(function(){
					lastItem = me.items.items[lastIndex] || me.items.items.last();
					if (lastItem) {
						lastItem.onceRendered
							.then(function(){
								wait()
									.then(function(){
										lastItem.el.scrollIntoView(me.el);
									});
							});
					}
				});
		}
	},


	clearChatStatusNotifications: function() {
		var ns = this.query('chat-notification-status'), me = this;
		Ext.each(ns, function(n) { me.remove(n); });
	},


	shouldAddTimestampBeforeMessage: function(msg) {
		var newMsgTime = msg.get('CreatedTime'),
			lastTimeStamp, intervalTimeStamp,
			stamp = Ext.Date.format(newMsgTime, 'F j, Y, g:i a'),//shouldn't this be the previous message's time?

			message = (this.query('chat-log-entry[message]') || []).last() || {};//defensive ...make sure we always have a value.

		message = message.message;

		lastTimeStamp = message ? message.get('CreatedTime') : null;
		if (!lastTimeStamp) {
			this.addNotification(stamp);
			return;
		}

		// Check if the incoming message is within 5 mins from the previous message. If not, print the last timestamp.
		// Time interval is arbitrary; we can make it whatever we want.
		intervalTimeStamp = Ext.Date.add(lastTimeStamp, Ext.Date.MINUTE, 5);
		if (!Ext.Date.between(newMsgTime, lastTimeStamp, intervalTimeStamp)) {
			this.addNotification(stamp);
		}
	},


	addStatusNotification: function(state) {
		var o = this.add({
			xtype: 'chat-notification-status',
			message: state
		});

		if (o.el && this.el && this.shouldAllowScrollingOnAdd) {
			o.el.scrollIntoView(this.el);
		}
	},


	addNotification: function(msg) {
		//we are going to add then scroll to
		var o = this.add({
			xtype: 'chat-notification-entry',
			message: msg
		});

		if (o.el && this.el && this.shouldAllowScrollingOnAdd) {
			o.el.scrollIntoView(this.el);
		}
	},


	showInputStateNotifications: function(changes) {
		if (!Ext.isArray(changes)) { return; }
		var me = this;
		Ext.each(changes, function(change) {
			UserRepository.getUser(change.user, function(u) {
				var name = u.getName(),
					state = change.state === 'composing' ? 'typing' : change.state,
					txt = name + ' is ' + state + '...';//TODO: find a way to put this into external strings
				if (change.state === 'paused') {
					this.clearChatStatusNotifications();
				}else {
					me.addStatusNotification(txt);
				}
			}, me);
		});
	},


	scroll: function(entry) {
		var input = entry.nextSibling('chat-reply-to');

		entry = input || entry;

		if (entry.el) {
			entry.el.scrollIntoView(this.el.first('.x-panel-body'));
		}
	},


	addMask: function() {
		if (this.rendered) {
			this.el.mask('loading chat history');
		}
	},


	removeMask: function() {
		if (this.rendered) {
			this.el.unmask();
		}
	},


	getMessages: function() {
		var entryWidgets = this.query(this.entryType),
			entries = [];

		Ext.each(entryWidgets, function(o) {
			entries.push(o.message);
		});

		return entries;
	},


	toggleModerationPanel: function() {
		this.el.toggleCls('moderating');
		Ext.each(this.el.query('.log-entry.flagged'), function(d) {
			Ext.fly(d).removeCls('flagged');
		});
		Ext.each(this.el.query('.control.checked'), function(d) {
			Ext.fly(d).removeCls('checked');
		});
	}
});
