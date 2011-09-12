
Ext.define('NextThought.view.widgets.main.TopControls', {
	extend: 'Ext.panel.Panel',
    alias: 'widget.top-controls',
    requires: [
        'NextThought.view.form.fields.SearchField',
        'NextThought.view.widgets.main.SessionInfo'
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
            layout: 'hbox',
            flex: 1,
            minWidth: (MIN_SIDE_WIDTH+165),
            items: [
                banner,
                NextThought.modeSwitcher ,
                { xtype:'tbspacer', flex:1 }
            ]
        });

        this.add({ xtype: 'searchfield', margin: 5, emptyText:'Search...', minWidth: CENTER_WIDTH/3, maxWidth: CENTER_WIDTH, flex: 1, id: 'searchBox'});

        this.add({
            layout: 'hbox',
            flex: 1,
            minWidth: MIN_SIDE_WIDTH,
            items: [
                { xtype:'tbspacer', flex:1 } ,
                {xtype: 'session-info'}
            ]
        });
    }
});