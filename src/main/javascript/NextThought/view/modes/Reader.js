

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

		var sideWidth = Globals.MIN_SIDE_WIDTH;

		this.add({
			dockedItems: this.getLeftToolbar(),
			minWidth: sideWidth,
			flex: 2,
			layout: {
				type:'hbox',
				pack: 'end'
			},
			items: {xtype:'filter-control',width: sideWidth}
		});

		this.add({
			cls: 'x-focus-pane',
			region: 'center',
			flex: 6,
			minWidth: this.CENTER_MIN_WIDTH,

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

		this.add({
			border: false,
			dockedItems: this.getRightToolbar(),
			minWidth: sideWidth,
			flex: 2,
			items: {xtype:'reader-items'}
		});


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
