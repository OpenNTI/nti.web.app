Ext.define('NextThought.view.widgets.classroom.LiveDisplay', {
	extend:'Ext.tab.Panel',
    alias: 'widget.live-display',
    requires: [
        'NextThought.view.content.Reader'
    ],

 	cls: 'nti-live-display',
    tabPosition: 'bottom',

    /*
    items: [
        {
            title: 'Content',
            xtype: 'reader-panel',
            belongsTo: this.roomInfo ? this.roomInfo.get('ContentId') : null,
            tabConfig: {
                tooltip: 'Show content'
            }
        },
       {
           title: 'Whiteboard',
           tabConfig: {
               tooltip: 'Show classroom whiteboard'
           }
       }
    ],
    */

    initComponent: function()
    {
        this.callParent(arguments);

        this.add(Ext.widget('reader-panel', {title: 'Content', belongsTo: this.roomInfo.get('ContainerId'), tabConfig:{tooltip: 'Live Content'}}));
        this.add({title:'Whiteboard', tabConfig:{tooltip: 'Live Whiteboard'}});
    },

    getReaderPanel: function()
    {
        return this.down('reader-panel');
    }
});