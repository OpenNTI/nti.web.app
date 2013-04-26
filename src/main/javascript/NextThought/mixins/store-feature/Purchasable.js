Ext.define('NextThought.mixins.store-feature.Purchasable',{

	needsPurchaseTpl: new Ext.XTemplate(Ext.DomHelper.markup({ cls: 'missing-context-info', cn:[
		{ cls:'bookcover', style: {backgroundImage: 'url({Icon})'} },
		{ cls:'meta', cn:[
			{ cls: 'title', html: '{Title}'},
			{ cls: 'byline', html: 'By {[values.Author||values.Provider]}'},
			{ cls: 'buy-this', cn:{ cls: 'button', html: 'Buy' } }
		]}
	] }))
});
