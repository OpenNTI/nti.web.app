Ext.define('NextThought.view.chat.View', {
	extend:'Ext.panel.Panel',
    alias: 'widget.chat-view',
	mixins:{ splitters: 'NextThought.mixins.SplitterMaintenance' },

    requires: [
        'NextThought.view.chat.Log',
        'NextThought.view.chat.OccupantsList',
        'NextThought.view.chat.ReplyTo',
        'NextThought.view.chat.PinnedMessageView',
        'NextThought.util.ClassroomUtils',
        'NextThought.cache.IdCache'
    ],

    layout: {
		type: 'hbox',
		align: 'stretch'
	},

    items:[
        {
			chatlog: true,
			flex: 2,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'chat-log-view',
					moderated: false,
                    flex:1
                },
                {
                    cls: 'chat-entry',
                    xtype: 'chat-reply-to',
                    mainEntry: true
                }

            ]
        }
    ],



    initComponent:function() {
		this.callParent(arguments);
		this.addOrUpdateSplitters();


		//In some cases, there may be a roomInfo tagged here.  Like in a chat window,
		//but not in a classroom.  At any rate, if it's there, listen for updates
		if (this.roomInfo){
			this.roomInfo.on('changed', this.roomInfoChanged, this);
		}
	},


	roomInfoChanged: function(roomInfo) {
		if (!this.roomInfo){return;}  //Only do this if it's there.

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


    changed: function(ri) {
        if (!ri){return;}

        //upon the roominfo appearing, see if we should show the classroom button or not
        if (!this.up('classroom-content')
			&& ClassroomUtils.isClassroomId(ri.get('ContainerId'))
			&& this.down('chat-reply-to')) {
            this.down('chat-reply-to').showClassroomButton();
        }
		this.initOccupants(false, ri);
    },


	disableChat: function(){
		this.down('chat-log-view').setDisabled(true);
		this.down('chat-reply-to').setDisabled(true);
	},


	initOccupants: function(moderated, ri) {
		var classContent = this.up('classroom-content'),
			occList = this.down('chat-occupants-list'),
			occupants = ri.get('Occupants');

		if (classContent) {
			classContent.down('classroom-management').down('chat-occupants-list').setOccupants(occupants, moderated);
			if (occList) {occList.hide();}
		}
		else if (occupants.length <= 2 && occList) {
			//in this case, we don't want to see it
			this.remove(occList);
		}
		else if (occupants.length <= 2 && !occList) {
			//In this case we dropped to below 2 users, but we didn't have a list in the first place, ignore it.
			console.debug('occupants dropped to <2 but is not shown anyway');
		}
		else if (occupants.length > 2 && !occList){
			//we need to add one
			occList = this.add({flex: 1, xtype: 'chat-occupants-list'});
			occList.setOccupants(occupants, moderated);
		}
		else if (occupants.length > 2 && occList) {
			//list already exists, just update
			occList.setOccupants(occupants, moderated);
		}
		else {
			console.error('Deciding to hide occupants list, a scenario I failed to plan for has occured', occupants, this);
		}
		this.addOrUpdateSplitters();
	},


    left: function() {
        this.down('textfield').destroy();
        this.down('chat-occupants-list').disable();
    },

	toggleModerationButton: function(on) {
		var ol = this.down('chat-occupants-list');
		if (ol){ol.toggleModerationButton(on);}
	},

    closeModerationPanel: function(roomInfo) {
        var modLog = this.down('chat-log-view[moderated=true]');

		if (modLog) {
			this.remove(modLog, true);
		}

		this.initOccupants(true, roomInfo);
		this.toggleModerationButton(false);
    },


	openModerationPanel: function(roomInfo) {
		this.insert(0,{ xtype: 'chat-log-view', moderated:  true, title: 'Moderated', flex: 1});

		this.down('textfield[chatentry]').focus();

		this.initOccupants(true, roomInfo);
		this.toggleModerationButton(true);
		this.addOrUpdateSplitters();
	},

    getPinnedMessageView: function() {
        var v = this.down('chat-pinned-message-view');

        if (!v) {
            v = this.down('[chatlog=true]').insert(0, {xtype: 'chat-pinned-message-view', flex: 1, showClear: this.el.hasCls('moderator')});
        }

        return v;
    }
}); 
