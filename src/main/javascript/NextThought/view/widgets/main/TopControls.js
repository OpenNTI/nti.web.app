
Ext.define('NextThought.view.widgets.main.TopControls', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.top-controls',
	requires: [
		'Ext.toolbar.Spacer',
		'NextThought.util.Globals',
		'NextThought.view.form.fields.SearchField',
		'NextThought.view.widgets.main.ModeSwitcher',
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
		var w = Globals.MIN_SIDE_WIDTH || 175;

		this.callParent(arguments);
		this.add({
			layout:{
				type: 'hbox',
				pack: 'start',
				align: 'stretchmax'
			},
			flex: 1,
			minWidth: (w+165),
			items: [
				{
					html: '<img src="'+Ext.BLANK_IMAGE_URL+'" class="header-logo" alt="banner" width="180" height="60" />',
					border: false,
					width: w,
					height: 60
				},
				{ xtype: 'modeswitcher' },
				{ xtype:'tbspacer', flex:1 }
			]
		});

		this.add({ xtype: 'searchfield', margin: 5, emptyText:'Search...', flex: 1, id: 'searchBox'});

		this.add({
			layout: 'hbox',
			flex: 1,
			minWidth: w,
			items: [
				{ xtype:'tbspacer', flex:1 } ,
				{ xtype: 'session-info', width: w }
			]
		});
	}
});
