Ext.define('NextThought.view.menus.navigation.Collection',{
	extend: 'Ext.view.View',
	alias: 'widget.navigation-collection',

	ui: 'navigation-collection',

	trackOver: true,
	overItemCls: 'selected',
	itemSelector: '.stratum.item',
	tpl: Ext.DomHelper.markup([
		{ cls: 'stratum collection-name', cn: [
			/*{ cls: 'settings' },*/
			'{name}',
			{cls:'count',html: '&nbsp;'}
		]},

		{ tag: 'tpl', 'for':'items', cn: [
			{ cls: 'stratum item', 'data-qtip': '{title}', cn:[
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


	collectData: function(){
		var data = {items: this.callParent(arguments)};
		data.name = this.name;
		return data;
	}
});
