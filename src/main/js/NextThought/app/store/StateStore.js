export default Ext.define('NextThought.app.store.StateStore', {
	extend: 'NextThought.common.StateStore',

	requires: ['NextThought.model.store.*'],

	PURCHASABLES: [],


	getPurchasables: function() {
		return this.PURCHASABLES;
	},


	setPurchasables: function(items) {
		this.PURCHASABLES = items;

		this.fireEvent('purchasables-set', items);
	}
});
