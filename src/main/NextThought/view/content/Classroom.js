Ext.define('NextThought.view.content.Classroom', {
	extend:'NextThought.view.content.Panel',
    alias: 'widget.classroom-content',
    requires: [
        'NextThought.view.widgets.chat.View',
        'NextThought.view.widgets.classroom.Management'
    ],

	cls: 'x-classroom-panel',

    layout: {
        type: 'hbox',
        align: 'stretch'
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

        this.add({xtype: 'chat-view', border: true, flex:1});
        this.add({xtype: 'classroom-management', border: true, roomInfo: this.roomInfo, width: 500});

        this.down('chat-view').changed(this.roomInfo);
    },

    onContent: function(msg, opts) {
        console.log('CONTENT channel message not supported yet');
        var ntiid = msg.get('body')['ntiid'];

        //content must have ntiid
        if (!ntiid) {
            console.error('Message of type CONTENT has no ntiid', msg);
            return;
        }

        this.fireEvent('navigate', ntiid);
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
            moderated = !!('moderated' in opts);

        var v = this.down('chat-view'),
            mlog = this.down('classroom-moderation').down('chat-log-view');

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
