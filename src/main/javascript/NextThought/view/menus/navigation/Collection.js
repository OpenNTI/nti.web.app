Ext.define('NextThought.view.menus.navigation.Collection',{
	extend: 'Ext.view.View',
	alias: 'widget.navigation-collection',

	requires: [
		'NextThought.providers.Location',
		'NextThought.Library'
	],

	ui: 'navigation-collection',

	trackOver: true,
	overItemCls: 'selected',
	itemSelector: '.stratum.item',
	tpl: Ext.DomHelper.markup([
		{ cls: 'stratum collection-name', cn: [
			{ cls: 'settings' },
			'{name}',
			{cls:'count',html: '&nbsp;'}
		]},

		{ tag: 'tpl', 'for':'items', cn: [
			{ cls: 'stratum item', title: '{title}', cn:[
				{ tag:'img', src: Ext.BLANK_IMAGE_URL, cls:'bookcover', style: {
					backgroundImage: 'url({icon})'
				}},
				{ cls: 'wrap', cn:[
					{ cls: 'title', html: '{title}' },
					{ cls: 'author', html: '{author}' }
				]}
			]}
		]}//,

//		{ cls: 'stratum drawer documents', cn:['Course Documents',{cls:'count',html: '&nbsp;'}] },
//		{ cls: 'stratum drawer dashboard', cn:['Dashboard',{cls:'count',html: '&nbsp;'}] }
	]),


	initComponent: function(){
		this.store = Library.getStore();
		this.callParent(arguments);

		this.mon(LocationProvider,'navigate',this.updateSelection,this);
	},


	updateSelection: function(ntiid){
		var last = LocationProvider.getLineage(ntiid).last();
		var r = this.store.findRecord('NTIID',last);
		if(r){
			this.getSelectionModel().select(r,false, true);
		}
	},


	afterRender: function(){
		this.callParent(arguments);
		this.updateSelection();
	},


	collectData: function(){
		var data = {items: this.callParent(arguments)};

		data.name = 'All Books';

		return data;
	}
});
