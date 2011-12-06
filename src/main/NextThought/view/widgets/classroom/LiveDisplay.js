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

       // this.add(Ext.widget('reader-panel', {title: 'Content', belongsTo: this.roomInfo.get('ContainerId'), tabConfig:{tooltip: 'Live Content'}}));
        this.add({title:'Whiteboard', tabConfig:{tooltip: 'Live Whiteboard'}});
        this.activate();
    },

    getReaderPanel: function() {
        return Ext.getCmp('readerPanel');
    },

    activate: function() {
        if (this.items.get(0) !== this.getReaderPanel()) {
            this.insert(0, this.getReaderPanel());
            if (!this.getReaderPanel().getDockedItems()[0]) {
                this.getReaderPanel().addDocked(
                    {dock:'bottom', xtype: 'breadcrumbbar', skipHistory: true}
                );
            }
            this.setActiveTab(0);
        }
    },

    destroy: function() {
        //remove reader so it is not destroyed
        this.getReaderPanel().removeDocked(0);
        this.remove(this.getReaderPanel(), false);

        //do this last
        this.callParent(arguments);
    }
});