

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
	defaultType: 'container',
	height: 60,
	layout: {
		type: 'hbox',
		align: 'middle'
	},
	items: [
		{
			layout:{
				type: 'hbox',
				pack: 'start',
				align: 'stretchmax'
			},
			flex: 1,
			items: [
				{
					xtype: 'component',
					html: '<img src="'+Ext.BLANK_IMAGE_URL+'" class="header-logo" alt="banner" width="180" height="60" />',
					border: false,
					width: 180,
					height: 60
				},
				{ xtype: 'modeswitcher' },
				{ xtype:'tbspacer', flex:1 }
			]
		},

		{ xtype: 'searchfield', margin: 5, emptyText:'Search...', flex: 1, id: 'searchBox'},

		{
			layout: 'hbox',
			flex: 1,
			items: [
				{ xtype:'tbspacer', flex:1 } ,
				{ xtype: 'session-info' }
			]
		}
	]
},function(){
	var w = 175,
		p = this.prototype;

	p.items[0].minWidth = w+165;
	p.items[2].minWidth = w;
	p.items[2].items[1].width = w;
});
