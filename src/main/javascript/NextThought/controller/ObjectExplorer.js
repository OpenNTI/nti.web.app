

Ext.define('NextThought.controller.ObjectExplorer', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.providers.Location'
	],

	views: [
		'Viewport',
		'widgets.main.LeftColumn',
		'widgets.ItemNavigator'
	],
	
	refs: [
		{ ref: 'viewport', selector: 'master-view' },
		{ ref: 'reader', selector: 'reader-mode-container reader-panel' }
	],

	init: function() {
		this.control({
			'leftColumn button[objectExplorer]': {
				'click': this.objectExplorerClicked
			},


			'item-navigator gridpanel': {
				'itemdblclick': this.itemNavigatorItemActivated
			},


			'item-navigator': {
				'annotation-destroyed': this.onRemoveAnnotation
			}

		},{});
	},


	onRemoveAnnotation: function(oid, containerId){
		this.getController('Reader').onRemoveAnnotation(oid,containerId);
	},


	itemNavigatorItemActivated: function(control, record, dom, index) {
		//TODO - reroute through search controller who can resolve top level containers...
		this.getController('Search').searchResultClicked(record);
	},


	objectExplorerClicked: function(btn, e, o) {
		if (!this.objectExplorer) {
			this.objectExplorer = Ext.create('Ext.Window', {
				id:'object-explorer',
				title: 'My Stuff',
				x:100,
				y:100,
				width: 500,
				height: 350,
				maximizable:true,
				layout: 'fit',
				closeAction: 'hide',
				hideMode: 'display',
				items: {xtype: 'item-navigator'}
			});
		}

		this.objectExplorer.show();
	}
});
