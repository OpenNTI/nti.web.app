Ext.define('NextThought.view.widgets.chat.View', {
	extend:'Ext.panel.Panel',
    alias: 'widget.chat-view',
	mixins:{ splitters: 'NextThought.mixins.SplitterMaintenance' },

    requires: [
        'NextThought.view.widgets.chat.Log',
        'NextThought.view.widgets.chat.OccupantsList',
        'NextThought.view.widgets.chat.ReplyTo',
        'NextThought.view.widgets.chat.PinnedMessageView',
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
        this.changed(this.roomInfo);
		this.addOrUpdateSplitters();
    },

    changed: function(ri) {
        if (!ri){return;}

        this.roomId = IdCache.getIdentifier(ri.getId());
        this.roomInfo = ri;
        this.roomInfo.on('changed', this.changed, this);
        this.roomInfo.on('left-room', this.left, this);

        //upon the roominfo appearing, see if we should show the classroom button or not
        if (!this.up('classroom-content')
			&& ClassroomUtils.isClassroomId(ri.get('ContainerId'))
			&& this.down('chat-reply-to')) {
            this.down('chat-reply-to').showClassroomButton();
        }
		this.initOccupants();
    },


	disableChat: function(){
		this.down('chat-log-view').setDisabled(true);
		this.down('chat-reply-to').setDisabled(true);
	},


	initOccupants: function(moderated) {
		var classContent = this.up('classroom-content'),
			occList = this.down('chat-occupants-list'),
			occupants = this.roomInfo.get('Occupants');

		if (classContent) {
			classContent.down('classroom-management').down('chat-occupants-list').setOccupants(occupants, this.roomId, moderated);
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
			occList.setOccupants(occupants, this.roomId, moderated);
		}
		else if (occupants.length > 2 && occList) {
			//list already exists, just update
			occList.setOccupants(this.roomInfo.get('Occupants'), this.roomId, moderated);
		}
		else {
			console.error('Deciding to hide occupants list, a scenario I failed to plan for has occured', occupants, this);
		}
		this.addOrUpdateSplitters();
	},


    left: function() {
        this.down('textfield').destroy();
        this.down('chat-occupants-list').disable();
        this.roomInfo.clearListeners();
        delete this.roomInfo;
    },

	toggleModerationButton: function(on) {
		var ol = this.down('chat-occupants-list');
		if (ol){ol.toggleModerationButton(on);}
	},

    closeModerationPanel: function() {
        var modLog = this.down('chat-log-view[moderated=true]');

		if (modLog) {
			this.remove(modLog, true);
		}

		this.initOccupants(true);
		this.toggleModerationButton(false);
    },


	openModerationPanel: function() {
		this.insert(0,{ xtype: 'chat-log-view', moderated:  true, title: 'Moderated', flex: 1});

		this.down('textfield[chatentry]').focus();

		this.initOccupants(true);
		this.toggleModerationButton(true);
		this.addOrUpdateSplitters();
	},

    getPinnedMessageView: function() {
        var v = this.down('chat-pinned-message-view');

        if (!v) {
            v = this.down('[chatlog=true]').insert(0, {xtype: 'chat-pinned-message-view', showClear: this.el.hasCls('moderator')});
        }

        return v;
    }
}); 
