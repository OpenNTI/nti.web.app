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
    /*
    items: [
       {
           xtype: 'chat-view',
           border: true,
           flex: 1
       },
        {
           xtype: 'classroom-management',
           border: true,
           roomInfo: this.roomInfo,
           width: 500

        }
    ],
    */

    initComponent: function() {
    	//vars
    	//this.roomInfo = null;
        this.callParent(arguments);

        this.add({xtype: 'chat-view', border: true, flex:1});
        this.add(Ext.widget('classroom-management', {border: true, roomInfo: this.roomInfo, width: 500}));

        this.down('chat-view').changed(this.roomInfo);
    },


    onMessage: function(msg, opts) {
        console.log('message', msg);
        var r = msg.get('ContainerId'),
            moderated = !!('moderated' in opts);


        var v = this.down('chat-view'),
            mlog = v ? v.down('chat-log-view[moderated=true]') : null;

        v.down('chat-log-view').addMessage(msg);

        if(!moderated && mlog) {
            mlog.removeMessage(msg);
        }
    }
});
