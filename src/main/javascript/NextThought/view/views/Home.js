Ext.define( 'NextThought.view.views.Home', {
	extend: 'NextThought.view.views.Base',
	alias:	'widget.home-view-container',
	requires: [
		'NextThought.view.content.Home'
	],
	
	items: { xtype: 'home-content-panel' }
});
