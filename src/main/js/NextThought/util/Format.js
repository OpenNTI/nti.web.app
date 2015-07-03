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
		d = d.ago();
		//if (/^4 weeks/i.test(d)) { d = '1 month ago'; }
		return d;
	},


	avatarURL: function(value) {
		return (value && value.get && value.get('avatarURL')) ||
			   (value && value.avatarURL) ||
			   User.BLANK_AVATAR;
	},


	avatar: function(value, cls) {
		var avatar = (value && value.get && value.get('avatarURL')) || (value && value.avatarURL),
			clsList = [cls || 'avatar', 'avatar-container'];

		function get(link) {
			return 'url(' + link + ')';
		}

		clsList = clsList.join(' ');

		return Ext.DomHelper.markup({cls: clsList, cn: [
			{cls: 'fallback avatar-pic', style: {backgroundImage: get(User.BLANK_AVATAR)}},
			{cls: 'profile avatar-pic', style: {backgroundImage: get(avatar)}}
		]});
	},


	background: function(value) {
		var background = (value && value.get && value.get('backgroundURL')) || (value && value.backgroundURL);

		if (!background) {
			return Ext.DomHelper.markup({cls: 'profile background-pic'});
		}

		return Ext.DomHelper.markup({cls: 'user-background-container', cn: [
			{cls: 'profile background-pic', style: {backgroundImage: 'url(' + background + ')'}}
		]});
	},


	boolStr: function(value, trueString, falseString) {
		trueString = trueString && getString(trueString);
		falseString = falseString && getString(falseString);
		return value ? (trueString || '') : (falseString || '');
	},

	displayName: function(value, me) {
		if (isMe(value) && me) {
			return me;
		}

		if (Ext.isString(value)) {
			return 'Resolving';
		}

		return value && (value.displayName || value);
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
	Ext.util.Format.avatar = NTIFormat.avatar;
	Ext.util.Format.background = NTIFormat.background;
});
