const Ext = require('extjs');
const {DateTime} = require('nti-web-commons');

const {getString} = require('legacy/util/Localization');
const {isMe} = require('legacy/util/Globals');
const FriendsList = require('legacy/model/FriendsList');
const User = require('legacy/model/User');

const NTIFormat =
module.exports = exports = Ext.define('NextThought.util.Format', {

	currencyInfo: {
		'USD' : {
			sign: '$',
			decimals: 2
		}
	},


	currency: function (value, currency) {
		var info = this.currencyInfo[currency] || {},
			sign = info.sign || currency,
			decimals = info.decimals,
			end = info.end || !info.sign;

		return Ext.util.Format.currency(value, sign, decimals, end);
	},

	ago: function (value/*, max, format*/) {
		return DateTime.fromNow(value);
	},


	avatarURL: function (value) {
		return (value && value.get && value.get('avatarURL')) ||
				(value && value.avatarURL) ||
				User.BLANK_AVATAR;
	},


	avatar: function (value, cls) {
		var avatar = getField('avatarURL'),
			bgColor = getField('avatarBGColor'),
			initials = getField('avatarInitials'),
			className = getField('Class'),
			defaultAvatar = className && className !== 'User' ? FriendsList.BLANK_AVATAR : User.BLANK_AVATAR,
			clsList = [cls || 'avatar', 'avatar-container'], cn = [];

		function getField (name) {
			return (value && value.get && value.get(name)) || (value && value[name]);
		}

		function getURL (link) {
			return 'url(' + link + ')';
		}

		if (className) {
			clsList.push(className);
		}

		clsList = clsList.join(' ');

		if (avatar) {
			cn.push({cls: 'profile avatar-pic', style: {backgroundImage: getURL(avatar)}});
		} else if (initials) {
			cn.push({cls: 'fallback avatar-pic initials', style: {'background-color': '#' + bgColor}, cn: {cls: 'inner', html: initials}});
		} else {
			cn.push({cls: 'fallback avatar-pic', style: {backgroundImage: getURL(defaultAvatar)}});
		}

		return Ext.DomHelper.markup({cls: clsList, cn: cn});
	},


	xavatar: function (value, cls) {
		var avatar = (value && value.get && value.get('avatarURL')) || (value && value.avatarURL),
			username = (value && value.get && value.get('Username')) || (value && value.Username),
			clazz = (value && value.get && value.get('Class')) || (value && value.Class),
			defaultAvatar = clazz !== 'User' ? FriendsList.BLANK_AVATAR : User.BLANK_AVATAR,
			clsList = [cls || 'avatar', 'avatar-container'],
			initials,
			cn = [], color, idx;

		function get (link) {
			return 'url(' + link + ')';
		}


		if (clazz) {
			clsList.push(clazz);
		}

		if (value && Ext.isFunction(value.getAvatarInitials)) {
			initials = value.getAvatarInitials();
		}
		else if (value) {
			initials = User.getAvatarInitials(value);
		}

		clsList = clsList.join(' ');
		if (initials) {
			idx = User.getUsernameHash(username);
			idx = (idx < 0 ? idx * -1 : idx) % NTIFormat.DEFAULT_AVATAR_BG_COLORS.length;
			color = NTIFormat.DEFAULT_AVATAR_BG_COLORS[idx];
			cn[0] = {cls: 'fallback avatar-pic initials', style: {'background-color': '#' + color}, cn: {cls: 'inner', html: initials}};
		} else {
			cn[0] = {cls: 'fallback avatar-pic', style: {backgroundImage: get(defaultAvatar)}};
		}

		cn[1] = {cls: 'profile avatar-pic', style: {backgroundImage: get(avatar)}};

		return Ext.DomHelper.markup({cls: clsList, cn: cn});
	},


	background: function (value) {
		var background = (value && value.get && value.get('backgroundURL')) || (value && value.backgroundURL);

		if (!background) {
			return Ext.DomHelper.markup({cls: 'profile background-pic'});
		}

		return Ext.DomHelper.markup({cls: 'user-background-container', cn: [
			{cls: 'profile background-pic', style: {backgroundImage: 'url(' + background + ')'}}
		]});
	},


	boolStr: function (value, trueString, falseString) {
		trueString = trueString && getString(trueString);
		falseString = falseString && getString(falseString);
		return value ? (trueString || '') : (falseString || '');
	},

	displayName: function (value, me) {
		if (isMe(value) && me) {
			return me;
		}

		if (Ext.isString(value)) {
			return 'Resolving';
		}

		return value && (value.displayName || value);
	},

	pluralIf: function (value) {
		return (value && this.plural.apply(this, arguments)) || '';
	}

}).create();

Ext.util.Format.ntiCurrency = NTIFormat.currency.bind(NTIFormat);
Ext.util.Format.ago = NTIFormat.ago;
Ext.util.Format.avatarURL = NTIFormat.avatarURL;
Ext.util.Format.boolStr = NTIFormat.boolStr;
Ext.util.Format.displayName = NTIFormat.displayName;
Ext.util.Format.pluralIf = NTIFormat.pluralIf;
Ext.util.Format.avatar = NTIFormat.avatar;
Ext.util.Format.background = NTIFormat.background;
