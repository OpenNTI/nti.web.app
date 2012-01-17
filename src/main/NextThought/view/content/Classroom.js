Ext.define('NextThought.view.content.Classroom', {
	extend:'NextThought.view.content.Panel',
	alias: 'widget.classroom-content',
	requires: [
		'NextThought.view.widgets.chat.View',
		'NextThought.view.widgets.classroom.Management',
		'NextThought.view.widgets.chat.OnDeckLog'
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

		this.add({xtype: 'chat-view', flex:2});
		this.add({xtype: 'classroom-management', roomInfo: this.roomInfo, width: 500});

		this.down('chat-view').changed(this.roomInfo);
	},


	showOnDeck: function() {
		this.insert(0, {xtype: 'chat-on-deck-log-view', flex: 1, roomInfo: this.roomInfo});
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
			moderated = !!('moderated' in opts),
			v = this.down('chat-view'),
			mlog = this.down('chat-log-view');

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
		return this._channelMap[channel].apply(this, arguments);
	}
});
