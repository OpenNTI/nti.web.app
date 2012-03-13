

Ext.define( 'NextThought.view.modes.Reader', {
	extend: 'NextThought.view.modes.Mode',
	alias: 'widget.reader-mode-container',
	requires: [
		'NextThought.view.content.Reader',
		'NextThought.view.widgets.Breadcrumb',
		'NextThought.view.widgets.FilterControlPanel',
		'NextThought.view.widgets.ReaderItemsPanel'
	],

	initComponent: function(){
		this.callParent(arguments);


		this.add(this.getSpacerColumn());
		this.add({ region: 'west', id: 'west-reader', xtype: 'leftColumn', columnWidget: {xtype:'filter-control'} });

		this.add({
			cls: 'x-focus-pane',
			region: 'center',
			flex: 6,
			minWidth: CENTER_WIDTH/3,

			border: false,
			frame: false,
			layout: 'fit',
			defaults: {border: false, frame: false},
			dockedItems: {id:'breadcrumb', dock:'top', xtype: 'reader-breadcrumbbar'},
			items: {
				xtype: 'reader-panel',
				id: 'readerPanel'
			}
		});

		this.add({ region: 'east', id:'east-reader', xtype: 'rightColumn', columnWidget: {xtype:'reader-items'} });
		this.add(this.getSpacerColumn());


		this.reader = Ext.getCmp('readerPanel');
		LocationProvider.on('navigate',this.reader.loadPage,this.reader);
	},


	restore: function(state){
		this.reader.restore(state);
	},

	getMainComponent: function(){
		return this.reader;
	}
});
