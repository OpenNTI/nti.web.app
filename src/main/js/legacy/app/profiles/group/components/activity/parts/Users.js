const Ext = require('@nti/extjs');

require('../../membership/parts/Users');


module.exports = exports = Ext.define('NextThought.app.profiles.group.components.activity.parts.Users', {
	extend: 'NextThought.app.profiles.group.components.membership.parts.Users',
	alias: 'widget.profile-group-membership-condensed',

	cls: 'memberships condensed group',
	title: 'Members',

	limit: 30,

	renderSelectors: {
		titleEl: '.title',
		entriesEl: '.entries',
		seeAllEl: '.see-all'
	},

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', cn: [{cls: 'title', html: '{title}'},
			{tag: 'a', cls: 'see-all', html: 'View All'}]},
		{cls: 'entries'}]),


	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: '{classes}', 'data-route': '{route}', 'data-qtip': '{name}', cn: [
			'{member:avatar}',
			{cls: 'name', html: '{name}'}
		]
	})),

	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.seeAllEl, 'click', this.onSeeAll.bind(this));
	},

	setUser: function (user, isMe) {
		this.creator = user.get('Creator');
		this.callParent(arguments);
	},

	setFriends: function (friends) {
		friends = friends.slice();

		if(this.creator) {
			friends.unshift(this.creator);
		}

		this.totalCount = friends.length;

		if(this.totalCount <= this.limit) {
			this.seeAllEl.hide();
		}

		friends = friends.slice(0, this.limit);
		let headingString = Ext.String.format('{0} ({1})', this.title, this.totalCount);
		this.titleEl.setHTML(headingString);

		return this.callParent([friends]);
	},

	configForUser: function (member) {
		var config = this.callParent(arguments),
			classes = ['entry'];
		if(member.get('Username') === this.creator) {
			classes.push('admin');
		}
		config.classes = classes.join(' ');
		return config;
	},

	onSeeAll: function () {
		this.gotoSeeAll();
	}
});
