Ext.define('NextThought.view.store.menus.Collection',{
	extend: 'NextThought.view.menus.navigation.Collection',
	alias: 'widget.purchasable-collection',

	menuItemTpl: Ext.DomHelper.markup({
		cls: 'stratum item', 'data-qtip': '{Title}', cn:[
			{ tag:'img', src: Ext.BLANK_IMAGE_URL, cls:'bookcover', style: {
				backgroundImage: 'url({icon})'
			}},
			{ cls: 'wrap', cn:[
				{ cls: 'title', html: '{Title}' },
				{ cls: 'author', html: '{Provider}' },
				{ cls: 'price', html: '${Amount}'}
			]}
		]
	}),

	listeners: {
		select: function(selModel,record){
			//allow reselect since we don't style the selected state, this has no
			// visual effect other than the ability to click on it again
			selModel.deselect(record);
		}
	},
});
