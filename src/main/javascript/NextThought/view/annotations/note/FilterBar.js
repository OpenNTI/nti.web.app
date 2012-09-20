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
				Ext.defer(function(){
					btn.up('window').down('note-carousel').filterChanged(btn.filter);
				},1);
				//clear search box?
			}
		},
		items: [
			{ text: 'All Threads', pressed: true},
			{ text: 'Most Commented', filter: 'mostPopular'},
			{ text: 'Most Liked', filter: 'highestRated'}
		]
	},{
//		xtype: 'simpletext',
		xtype: 'box',
		width: 150,
		placeholder: 'Search...'
	}],

	afterRender: function(){
		var me = this, search;

		me.callParent(arguments);

		search = me.down('simpletext');
		if(search){
			me.mon(search,{
				scope: me,
				commit:me.search,
				clear: function(){me.search('');}
			});
		}
	},


	search: function(searchTerm){
		this.up('window').down('note-carousel').filterChanged('search',searchTerm);
	}
});
