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
    items: [
       {
           xtype: 'chat-view',
           border: true,
           flex: 1
       },
        {
           xtype: 'classroom-management',
           border: true,
           width: 500

        }
    ],

    //vars
    roomInfo: null,

    initComponent: function()
    {
        this.callParent(arguments);
    },

    onMessage: function(msg, opts) {
        console.log('message', msg);
        var r = msg.get('ContainerId'),
            moderated = !!('moderated' in opts);


        var v = this.down('chat-view'),
            mlog = v ? v.down('chat-log-view[moderated=true]') : null;

        //tab.down('chat-log-view[moderated='+moderated+']').addMessage(msg);
        v.down('chat-log-view').addMessage(msg);

        if(!moderated && mlog) {
            mlog.removeMessage(msg);
        }
    },

    classroomStart: function(roomInfo) {
        this.roomInfo = roomInfo;
        this.down('chat-view').changed(roomInfo);
    },

    afterRender: function() {
        console.log('log after render happens...');
        this.fireEvent('isactive');
    }
});