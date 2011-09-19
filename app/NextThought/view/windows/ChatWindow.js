Ext.define('NextThought.view.windows.ChatWindow', {
	extend: 'Ext.window.Window',
	alias : 'window.chat',

    width: 500,
    height: 350,
    maximizable:true,
    title: 'Chat',
    layout: 'border',

//    dockedItems:[{
//        docked: 'top',
//        xtype: 'toolbar',
//        items:['->',{text:'hi'}]
//    }],

    items: [
        {
            region: 'center',
            xtype: 'tabpanel',
            items: {
                title: 'tab',
                closable: true
            }
        },
        {
            region: 'east',
//            collapsible: true,
            frame: false,
            split: true,
            width: 200,
            layout: 'accordion',
            items: [
                {
                    title: 'Tools'
                },
                {
                    title: 'Buddies'
                }
            ]
        }
    ]
});