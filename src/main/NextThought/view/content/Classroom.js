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
		this.channelMap = {
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
					maintainFlex: true,
					minWidth: 250,
					flex: 1}
			);
		}

		if (!tab && script) {
			tPanel.add({xtype: 'script-log-view', classscriptid: saneId, roomInfo: this.roomInfo, script: script, title:name});
		}

		this.addOrUpdateSplitters();
	},

	addOrUpdateSplitters: function() {
		var index;

		//remove all splitters that currently exist:
		this.items.each(function(i){
				if (i instanceof Ext.resizer.Splitter) {
					this.remove(i, true);
				}
			},
			this);

		//add splitters between each component
		this.items.each(function(i){
				index = this.items.indexOf(i);
				if (index < (this.items.getCount() - 1)){
					this.insert(this.items.indexOf(i) + 1,
						{xtype:'splitter'}
					);
				}
			},
			this);
	},

	showMod: function() {
		this.insert(0,{
			xtype: 'chat-log-view',
			title: 'moderation',
			flex: 1,
			moderated: true,
			minWidth: 250
		});
		this.addOrUpdateSplitters();
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
