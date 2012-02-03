Ext.define('NextThought.view.content.Classroom', {
	extend:'NextThought.view.content.Panel',
	alias: 'widget.classroom-content',
	requires: [
		'NextThought.view.widgets.chat.View',
		'NextThought.view.widgets.classroom.Management',
		'NextThought.view.widgets.classroom.ScriptLog'
	],

	cls: 'x-classroom-panel',

	layout: {
		type: 'hbox',
		align: 'stretch'
	},
	border: false,
	defaults: {
		border: false,
		defaults: {
			border: false
		}
	},

	initComponent: function() {
		//vars
		//this.roomInfo = null;
		this.callParent(arguments);

		//table of behavious based on channel
		this._channelMap = {
			'CONTENT': this.onContent,
			'POLL': this.onPoll,
			'META': this.onMeta,
			'DEFAULT': this.onDefault,
			'WHISPER' : this.onDefault
		};

		this.add({xtype: 'chat-view', flex:2, title: 'Class Chat'});
		this.add({xtype: 'classroom-management', roomInfo: this.roomInfo, width: 500});

		this.down('chat-view').changed(this.roomInfo);
	},


	addScriptView: function(script, name) {
		var chat = this.down('chat-view'),
			insertIndex = this.items.indexOf(chat),
			tPanel = this.down('tabpanel[scriptlog]'),
			saneId = script ? IdCache.getIdentifier(script.getId()) : null,
			tab = tPanel ? tPanel.down('script-log-view[classscriptid='+saneId+']') : null;

		if (!tPanel) {
			tPanel = this.insert(insertIndex,{
					xtype: 'tabpanel',
					scriptlog: true,
					flex: 1}
			);
		}

		if (!tab && script) {
			tPanel.add({xtype: 'script-log-view', classscriptid: saneId, roomInfo: this.roomInfo, script: script, title:name});
		}
	},


	showMod: function() {
		this.insert(0,{
			xtype: 'chat-log-view',
			title: 'moderation',
			flex: 1,
			moderated: true
		});
	},


	onContent: function(msg, opts) {
		console.log('content for display received', msg, opts);
		var ntiid = msg.get('body').ntiid;

		//content must have ntiid
		if (!ntiid) {
			console.error('Message of type CONTENT has no ntiid', msg);
			return;
		}

		this.fireEvent('content-message-received', ntiid);
		return true;
	},

	onPoll: function(msg, opts) {
		console.log('POLLS not supported yet');
		return false;
	},

	onMeta: function(msg, opts) {
		return false;
	},

	onDefault: function(msg, opts) {
		var r = msg.get('ContainerId'),
			moderated =  opts.hasOwnProperty('moderated'),
			v = this.down('chat-view'),
			mlog = this.down('chat-log-view[moderated]');

		if (moderated) {
			mlog.addMessage(msg);
		}
		else {
			v.down('chat-log-view').addMessage(msg);
		}

		if(!moderated && mlog) {
			mlog.removeMessage(msg);
		}
		return true;
	},

	onMessage: function(msg, opts) {
		var channel = msg.get('channel');

		//if this is from a script, pass it along to do something there...
		this.onScriptMessage(msg);

		return this._channelMap[channel].apply(this, arguments);
	},

	onScriptMessage: function(msg) {
		console.log('once scripts are saved, we should move script element selection here b/c we will be able to find the message by id at that point');
		var script = this.down('script-log-view'),
			id = IdCache.getIdentifier(msg.getId());

		if (!script) {
			return;
		}

		//TODO: consequently, only do this id we end up marking something as promoted:
		script.scrollToFirstNonPromotedEntry();
	}
});
