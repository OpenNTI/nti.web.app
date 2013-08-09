Ext.define('NextThought.view.store.menus.Collection',{
	extend: 'NextThought.view.menus.navigation.Collection',
	alias: 'widget.purchasable-collection',

	overItemCls: 'over',

	menuItemTpl: Ext.DomHelper.markup({
		cls: 'stratum purchasable item', 'data-qtip': '{Title}', cn:[
			{ cls:'cover', style: { backgroundImage: 'url({Icon})' }},
			{ cls: 'meta', cn:[
				{ cls: 'title', html: '{Title}' },
				{ cls: 'author', html: '{Provider}' },
				{ cls: 'price', html: '{Amount:ntiCurrency(values.Currency)}'},
				{tag: 'tpl', 'if': 'HasHistory', cn: [
					{ cls: 'history', html: 'Purchase History'}
				]}
			]}
		]
	}),

	onBeforeItemClick: function(record, item, idx, event, opts){
		var t = event && event.getTarget && event.getTarget();

		if(t && Ext.fly(t).hasCls('history')){
			this.fireEvent('history-click', record);
			return false;
		}

		return true;
	}
});
