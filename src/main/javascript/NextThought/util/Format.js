Ext.define('NextThought.util.Format', {
	singleton: true,

	currencyInfo: {
		'USD' : {
			sign: '$',
			decimals: 2
		}
	},


	currency: function(value, currency) {
		var info = this.currencyInfo[currency] || {},
			sign = info.sign || currency,
			decimals = info.decimals,
			end = info.end || !info.sign;

		return Ext.util.Format.currency(value, sign, decimals, end);
	},

	ago: function(value, max, format) {

		var d = new Duration(Math.abs(value - new Date()) / 1000);
		return d.ago();
	},


	avatarURL: function(value) {
		return (value && value.get && value.get('avatarURL')) || User.BLANK_AVATAR;
	},

	boolean: function(value, trueString, falseString) {
		return value ? (trueString || '') : (falseString || '');
	}

},function() {
	window.NTIFormat = this;
	Ext.util.Format.ntiCurrency = NTIFormat.currency.bind(NTIFormat);
	Ext.util.Format.ago = NTIFormat.ago.bind(NTIFormat);
	Ext.util.Format.avatarURL = NTIFormat.avatarURL.bind(NTIFormat);
	Ext.util.Format.boolean = NTIFormat.boolean.bind(NTIFormat);
});
