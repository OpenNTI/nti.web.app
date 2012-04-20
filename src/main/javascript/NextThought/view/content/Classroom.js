Ext.define('NextThought.view.content.Classroom', {
	extend:'NextThought.view.content.Panel',
	alias: 'widget.classroom-content',
	mixins:{ splitters: 'NextThought.mixins.SplitterMaintenance' },
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
		this.callParent(arguments);

		//table of behavious based on channel
		this.channelMap = {
			'CONTENT': this.onContent,
			'POLL': this.onPoll,
			'META': this.onMeta,
			'DEFAULT': this.onDefault,
			'WHISPER' : this.onDefault
		};

		this.add({xtype: 'chat-view', flex:2, title: 'Class Chat'});
		this.add({xtype: 'classroom-management', width: 500, flex: 1});
		this.down('chat-view').changed(this.roomInfo);
		this.addOrUpdateSplitters();


		//In the room info changes, do something perhaps?
		this.roomInfo.on('changed', this.roomInfoChanged, this);
	},


	roomInfoChanged: function(roomInfo) {
		//Just checking to see if we got the correct room info
		if (roomInfo.getId() !== this.roomInfo.getId()) {
			console.error('Got a RoomInfo change event for a RoomInfo that has a different ID, current', this.roomInfo, 'new', roomInfo);
			return;
		}

		//stop listening on old room info, reassign and start listening again.
		this.roomInfo.un('changed', this.roomInfoChanged, this);
		this.roomInfo = roomInfo;
		this.roomInfo.on('changed', this.roomInfoChanged, this);
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
					maintainFlex: true,
					minWidth: 250,
					flex: 1}
			);
		}

		if (!tab && script) {
			tPanel.add({xtype: 'script-log-view', classscriptid: saneId, script: script, title:name});
		}

		this.addOrUpdateSplitters();
	},


	toggleModerationButton: function(on) {
		this.down('classroom-management').down('chat-occupants-list').toggleModerationButton(on);
	},


	removeMod: function() {
		var mod = this.down('chat-log-view[moderated=true]');
		if (mod) {
			this.remove(mod, true);
		}
		this.toggleModerationButton(false);
		this.addOrUpdateSplitters();
	},


	showMod: function() {
		this.insert(0,{
			xtype: 'chat-log-view',
			title: 'moderation',
			flex: 1,
			moderated: true
		});
		this.toggleModerationButton(true);
		this.addOrUpdateSplitters();
	},


	onContent: function(msg, opts) {
		var ntiid = msg.get('body').ntiid,
			l = LocationProvider.getLocation(ntiid),
			moderated =  opts.hasOwnProperty('moderated'),
			v = this.down('chat-view'),
			mlog = this.down('chat-log-view[moderated=true]');

		//content must have ntiid
		if (!ntiid) {
			console.error('Message of type CONTENT has no ntiid', msg);
			return;
		}

		if (l){
			this.fireEvent('content-message-received', ntiid, this.roomInfo.getId());
			return; //it's navigatable, don't add to log
		}

		if (moderated) {
			mlog.addContentMessage(msg);
		}
		else {
			v.down('chat-log-view[moderated=false]').addContentMessage(msg);
		}

		if(!moderated && mlog) {
			mlog.removeMessage(msg);
		}
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
			mlog = this.down('chat-log-view[moderated=true]');

		if (moderated) {
			mlog.addMessage(msg);
		}
		else {
			v.down('chat-log-view[moderated=false]').addMessage(msg);
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

		return this.channelMap[channel].apply(this, arguments);
	},

	onScriptMessage: function(msg) {
		var script = this.down('script-log-view'),
			id = IdCache.getIdentifier(msg.getId());

		if (!script) {
			return;
		}

		//TODO: consequently, only do this id we end up marking something as promoted:
		script.scrollToFirstNonPromotedEntry();
	}
});
