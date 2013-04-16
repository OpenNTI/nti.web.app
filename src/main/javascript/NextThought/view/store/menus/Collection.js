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
	})
});
