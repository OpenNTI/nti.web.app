Ext.define('NextThought.util.Format', {
	singleton: true,

	currencyInfo: {
		'USD' : {
			sign: '$',
			decimals: 2
		}
	},


	formatCurrency: function(value, currency){
		var info = this.currencyInfo[currency] || {},
			sign = info.sign || currency,
			decimals = info.decimals,
			end = info.end || !Boolean(info.sign);

		return Ext.util.Format.currency(value, sign, decimals, end);
	}


},function(){
	window.NTIFormat = this;
	Ext.util.Format.ntiFormatCurrency = Ext.Function.bind( NTIFormat.formatCurrency, NTIFormat);
});
