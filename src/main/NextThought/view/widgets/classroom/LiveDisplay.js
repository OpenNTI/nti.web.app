Ext.define('NextThought.view.widgets.classroom.LiveDisplay', {
	extend:'Ext.tab.Panel',
    alias: 'widget.live-display',
    requires: [
        'NextThought.view.content.Reader'
    ],

 	cls: 'nti-live-display',
    tabPosition: 'bottom',

    initComponent: function()
    {
        this.callParent(arguments);

        this._content = this.add({autoScroll: true, tabConfig:{title: 'Content', tooltip: 'Live Content'}, dockedItems: {dock:'bottom', xtype: 'breadcrumbbar', skipHistory: true}});
        this._whiteboard = this.add({tabConfig:{title:'Whiteboard', tooltip: 'Live Whiteboard'}});
    },

    getReaderPanel: function() {
        return Ext.getCmp('readerPanel');
    },

    destroy: function() {
        //remove reader so it is not destroyed
        this._content.remove(this.getReaderPanel(), false);

        //do this last
        this.callParent(arguments);
    }
});