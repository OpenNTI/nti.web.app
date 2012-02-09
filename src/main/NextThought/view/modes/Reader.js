

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

		var reader = Ext.widget('reader-panel',{id:'readerPanel'});

		this.add(this.getSpacerColumn());
		this.add({ region: 'west', id: 'west-book', xtype: 'leftColumn', columnWidget: {xtype:'filter-control'} });

		this.center = this.add({
			cls: 'x-focus-pane',
			region: 'center',
			flex: 6,
			minWidth: CENTER_WIDTH/3,

			border: false,
			frame: false,
			layout: 'fit',
			defaults: {border: false, frame: false},
			dockedItems: {id:'breadcrumb',dock:'top', xtype: 'breadcrumbbar'},
			items: reader
		});

		this.add({ region: 'east', id:'east-book', xtype: 'rightColumn', columnWidget: {xtype:'reader-items'} });
		this.add(this.getSpacerColumn());

		this.reader = reader;
	},


	restore: function(state){
		this.reader.restore(state);
	},

	restoreReader: function() {
		if (!this.center.items.getCount()) {
			this.center.add(this.reader);
			this.reader.bufferedDelayedRelayout();
		}
	},

	getMainComponent: function(){
		return this.reader;
	}
});
