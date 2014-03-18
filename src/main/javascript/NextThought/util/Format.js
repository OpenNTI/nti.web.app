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

	boolStr: function(value, trueString, falseString) {
		return value ? (trueString || '') : (falseString || '');
	},

	displayName: function(value, me) {
		if (isMe(value)) {
			return me || 'you';
		}

		if (Ext.isString(value)) {
			return 'Resolving';
		}

		return value;
	},

	pluralIf: function(value) {
		return (value && this.plural.apply(this, arguments)) || '';
	}

},function() {
	window.NTIFormat = this;
	Ext.util.Format.ntiCurrency = Ext.bind(NTIFormat.currency, NTIFormat);//PhantomJS doesn't support .bind()
	Ext.util.Format.ago = NTIFormat.ago;
	Ext.util.Format.avatarURL = NTIFormat.avatarURL;
	Ext.util.Format.boolStr = NTIFormat.boolStr;
	Ext.util.Format.displayName = NTIFormat.displayName;
	Ext.util.Format.pluralIf = NTIFormat.pluralIf;
});
