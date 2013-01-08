Ext.define('NextThought.view.chat.Log', {
	extend:'Ext.container.Container',
	alias: 'widget.chat-log-view',
	requires: [
		'NextThought.model.MessageInfo',
		'NextThought.view.chat.log.Entry',
		'NextThought.view.chat.log.NotificationEntry',
		'NextThought.view.chat.log.Moderated',
		'NextThought.view.chat.log.Content',
		'NextThought.view.chat.log.Info',
		'NextThought.cache.IdCache'
	],

	cls: 'chat-log-view',
	overflowX: 'hidden',
	overflowY: 'auto',
	layout: {
		type:'auto',
		reserveScrollbar: false
	},
	defaults: {border: false},


	getMessageQuery: function(id){
		return Ext.String.format('{0}[messageId={1}]', this.entryType, IdCache.getIdentifier(id));
	},


	initComponent:function() {

		this.entryType = this.entryType || 'chat-log-entry';
		this.moderated = !!this.moderated;
		if(this.moderated){
		   this.entryType+='-moderated';

		   this.tools = [
						{
							type: 'gear',
							tooltip: 'select all',
							action: 'selectall'
						},
						{
							type: 'help',
							tooltip: 'select none',
							action: 'selectnone'
						},
						{
							type: 'next',
							tooltip: 'approve selected',
							action: 'approve'
						},
						{
							type: 'prev',   
							tooltip: 'reject selected',
							action: 'reject'
						}
					];
			this.dockedItems = {
			   xtype: 'toolbar',
			   dock: 'bottom',
			   items: [
				   {
					   text: 'Select All',
					   action: 'selectall'
				   },
				   {
					   text: 'Select None',
					   action: 'selectnone'},
				   {
					   text: 'Approve',
					   action: 'approve'},
				   {
					   text: 'Reject',
					   action: 'reject'}
			   ]
			};
		}

		this.callParent(arguments);
	},


	selectall: function() {
		Ext.each(this.query(this.entryType), function(f){
			f.setValue(true);
		});
	},


	selectnone: function() {
		Ext.each(this.query(this.entryType), function(f){
			f.setValue(false);
		});
	},


	approve: function(){
		var a = [];

		Ext.each(this.query(this.entryType), function(f){
			if(f.getValue()){
				a.push(f.message.get('ID'));
			}
		},this);

		this.fireEvent('approve', a);
	},

	reject: function() {
		Ext.each(this.query(this.entryType), function(f){
			if(f.getValue()){this.remove(f);}
		},this);
	},

	removeMessage: function(msg) {
		var c,m = this.down(this.getMessageQuery(msg.getId()));
		if (m) {
			c = m.ownerCt;
			c.remove(m);
//			console.debug('c=', c);
			if(c.xtype !== 'chat-log-view' && c.items.getCount() === 0){c.destroy();}
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
		Ext.each(messages, function(msg){
			this.addMessage(msg);
		}, this);
	},


	failedToLoadTranscript: function(){
		console.error('failed to load transcript', arguments);
	},

	addMessage: function(msg) {
		var id = msg.getId(),
			rid = msg.get('inReplyTo'),
			m = id ? this.down(this.getMessageQuery(id)) : null,
			mStat = msg.get('Status'),
			o;
		if (!id){console.warn('This message has no NTIID, cannot be targeted!', msg);}

		if (m){
			m.update(msg);
			return;
		}

		//m is what we want to add too. It's either the root container (this) or its the replied-to-entry.
		m = this;

		if (rid){
			m = this.down(this.getMessageQuery(rid));
			if(!m){
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

		//we are going to add then scroll to
		o = m.add({
						xtype: this.entryType,
						message: msg,
						messageId: IdCache.getIdentifier(msg.getId())
					});

		if(o.el && this.el){
			o.el.scrollIntoView(this.el);
		}
	},


	addNotification: function(msg) {
		//we are going to add then scroll to
		var o = this.add({
			xtype: 'chat-notification-entry',
			message: msg
		});

		if(o.el && this.el){
			o.el.scrollIntoView(this.el);
		}
	},


	scroll: function(entry) {
		var input = entry.nextSibling('chat-reply-to');

		entry = input || entry;

		if (entry.el){
			entry.el.scrollIntoView(this.el.first('.x-panel-body'));
		}
	},


	getMessages: function(){
		var entryWidgets = this.query(this.entryType),
			entries = [];

		Ext.each(entryWidgets, function(o){
			entries.push(o.message);
		});

		return entries;
	},


    toggleModerationPanel: function(){
        this.el.toggleCls('moderating');
        Ext.each(this.el.query('.log-entry.flagged'), function(d){
            Ext.fly(d).removeCls('flagged');
        });
        Ext.each(this.el.query('.control.checked'), function(d){
            Ext.fly(d).removeCls('checked');
        });
    }
});
