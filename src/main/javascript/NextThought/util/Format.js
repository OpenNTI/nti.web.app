Ext.define('NextThought.util.Format', {
	singleton: true,

	currencyInfo: {
		'USD': {
			sign:     '$',
			decimals: 2
		}
	},


	currency: function (value, currency) {
		var info = this.currencyInfo[currency] || {},
				sign = info.sign || currency,
				decimals = info.decimals,
				end = info.end || !info.sign;

		return Ext.util.Format.currency(value, sign, decimals, end);
	}

}, function () {
	window.NTIFormat = this;
	Ext.util.Format.ntiCurrency = Ext.bind(NTIFormat.currency, NTIFormat);
});
