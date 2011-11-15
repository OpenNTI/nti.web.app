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
    items: [
       {
           xtype: 'live-display',
           height: 400

       },
        {
           xtype: 'classroom-moderation',
           flex: 1,
           border: true
        }
    ]

});