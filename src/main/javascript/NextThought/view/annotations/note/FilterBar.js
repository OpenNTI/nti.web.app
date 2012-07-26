Ext.define('NextThought.view.annotations.note.FilterBar',{
	extend: 'Ext.container.Container',
	alias: 'widget.note-filter-bar',

	cls: 'filter-bar',
	height: 50,
	layout: {
		type:'hbox',
		align: 'middle'
	},
	items: [{
		xtype: 'container',
		flex: 1,
		layout: { type: 'hbox', align: 'strechmax' },
		defaults: {
			xtype: 'button',
			allowDepress: false,
			enableToggle: true,
			toggleGroup: 'filters',
			plain: true,
			ui: 'note-filter',
			scale: '',
			handler: function(btn){
				btn.up('window').down('note-carousel').filterChanged(btn.filter);
			}
		},
		items: [
			{ text: 'Show All', pressed: true},
			{ text: 'Most Popular', filter: 'mostPopular'},
			{ text: 'Highest Rated', filter: 'highestRated'}
		]
	},{
		xtype: 'simpletext',
		width: 150,
		placeholder: 'Search...'
	}]
});
