Ext.define('NextThought.view.widgets.classroom.LiveDisplay', {
	extend:'Ext.tab.Panel',
    alias: 'widget.live-display',
    requires: [
    ],

 	cls: 'nti-live-display',
    tabPosition: 'bottom',

    items: [
       {
           title: 'Whiteboard',
           tabConfig: {
               tooltip: 'Show classroom whiteboard'
           }
       },
       {
           title: 'Content',
           tabConfig: {
               tooltip: 'Show content'
           }
       }
    ]

});