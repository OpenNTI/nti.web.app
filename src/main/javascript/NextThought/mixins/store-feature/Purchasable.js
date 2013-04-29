Ext.define('NextThought.mixins.store-feature.Purchasable',{

	needsPurchaseTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{ cls:'missing-context-msg', html:'Your free sample does not include access to this content.' },
		{ cls: 'missing-context-info', cn:[
			{ cls:'bookcover', style: {backgroundImage: 'url({Icon})'} },
			{ cls:'price', html:'{[NTIFormat.currency((values.price||values.Amount), values.Currency)]}' },
			{ cls:'meta', cn:[
				{ cls: 'title', html: '{Title}'},
				{ cls: 'byline', html: 'By {[values.Author||values.Provider]}'},
				{ cls: 'buy-this', cn:{ cls: 'button', html: 'Buy Now' } }
			]}
		]}
	]))
});
