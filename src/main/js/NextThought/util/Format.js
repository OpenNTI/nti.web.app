Ext.define('NextThought.util.Format', {
	singleton: true,
	
	//http://www.materialui.co/colors 600 line
	DEFAULT_AVATAR_BG_COLORS: ['5E35B1', '3949AB', '1E88E5', '039BE5',
				   '00ACC1', '00897B', '43A047', '7CB342',
				   'C0CA33', 'FDD835', 'FFB300', 'FB8C00',
				   'F4511E'],

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
			clsList = [cls || 'avatar', 'avatar-container'],
			initials = value && Ext.isFunction(value.getAvatarInitials) && value.getAvatarInitials(),
			cn=[], color;

		function get(link) {
			return 'url(' + link + ')';
		}
		
		function hash(str){
			var hash = 0, c;
			if (str.length == 0) return hash;
			for (i = 0; i < str.length; i++) {
				c = str.charCodeAt(i);
				hash = ((hash<<5)-hash)+c;
				hash = hash & hash; // Convert to 32bit integer
			}
			return hash;
		}

		clsList = clsList.join(' ');
		if(initials && isFeature('default-avatar-to-initials')){
			color = NextThought.util.Format.DEFAULT_AVATAR_BG_COLORS[hash(value.get('Username')) % NextThought.util.Format.DEFAULT_AVATAR_BG_COLORS.length];
			cn[0] = {cls: 'fallback avatar-pic initials', style: {'background-color': '#'+color}, cn: {cls: 'inner', html: initials}};
		}
		else{
			cn[0] = {cls: 'fallback avatar-pic', style: {backgroundImage: get(User.BLANK_AVATAR)}}
		}
		
		cn[1] = {cls: 'profile avatar-pic', style: {backgroundImage: get(avatar)}}

		return Ext.DomHelper.markup({cls: clsList, cn: cn});
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
