
Ext.define('NextThought.view.widgets.TopControls', {
	extend: 'Ext.panel.Panel',
    alias: 'widget.top-controls',
    requires: [
        'NextThought.view.form.SearchField',
        'NextThought.view.widgets.SessionInfo'
    ],
	
	cls: 'x-brand-and-search-bar',
	frame: false,
	border: false,
	defaults: {frame: false, border: false},
	height: 60,
	layout: {
		type: 'hbox',
		align: 'middle'
	},
    items: [],

    initComponent: function(){

        this.callParent(arguments);
        var banner =  {
            html: '<img src="resources/images/ntbanner.png" alt="banner" width="180" height="60" />',
            border: false,
            width: MIN_SIDE_WIDTH,
            height: 60
        };

        this.add({
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            flex: 1,
            items: [
                banner,
                NextThought.modeSwitcher ,
                { xtype:'tbspacer', flex:1 }
            ]
        });

        this.add({ xtype: 'searchfield', margin: 5, emptyText:'Search...', width: CENTER_WIDTH, id: 'searchBox'});

        this.add({
            layout: 'hbox',
            flex: 1,
            items: [
                { xtype:'tbspacer', flex:1 } ,
                {xtype: 'session-info'}
            ]
        });
    }
});