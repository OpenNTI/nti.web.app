Ext.define('NextThought.view.widgets.classroom.Management', {
	extend:'NextThought.view.content.Panel',
    alias: 'widget.classroom-management',
    requires: [
        'NextThought.view.widgets.classroom.LiveDisplay',
        'NextThought.view.widgets.classroom.Moderation'
    ],

	cls: 'nti-classroom-management',

    layout: {
        type: 'vbox',
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

        this.add({xtype: 'live-display', height: 400, roomInfo: this.roomInfo});
        this.add({xtype: 'classroom-moderation', flex:1});
    }
});
