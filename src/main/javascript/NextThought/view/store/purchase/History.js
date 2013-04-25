Ext.define('NextThought.view.store.purchase.History',{
	extend: 'NextThought.view.store.purchase.DetailView',
	alias: 'widget.purchase-history',

	ui: 'purchase-history-panel',

	renderTpl: Ext.DomHelper.markup({
		tag: 'table',
		cn:[{
			tag: 'thead', cn:{ tag:'tr', cn:[
				{tag: 'th', cls: 'key', html: 'Licence or Activation Key'},
				{tag: 'th', cls: 'qty', html: 'Usage / Qty'},
				{tag: 'th', cls: 'tot', html: 'Total'}
			]}
		},{
			tag: 'tbody', cn:{ tag: 'tpl', 'for':'.', cn:{ tag:'tr', cls:'{type}', cn:[
				{tag: 'td', cls: 'key', cn:['{key}',{html:'Purchased {date:format("m d, Y")}'}]},
				{tag: 'td', cls: 'qty', html: '{usage} / {qty}'},
				{tag: 'td', cls: 'tot', html: '{price}'}
			]}}
		}]
	}),

	ordinal: 'history',

	setupRenderData: function(){
	}

});
