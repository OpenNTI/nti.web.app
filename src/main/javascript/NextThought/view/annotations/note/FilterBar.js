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
		xtype: 'simpletext',
		width: 150,
		placeholder: 'Search...'
	}],

	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.down('simpletext'),{
			scope: this,
			commit:this.search,
			clear: function(){this.search('');}
		});
	},


	search: function(searchTerm){
		this.up('window').down('note-carousel').filterChanged('search',searchTerm);
	}
});
