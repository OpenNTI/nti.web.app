const Ext = require('extjs');

const UserRepository = require('legacy/cache/UserRepository');
const StoreUtils = require('legacy/util/Store');

require('../../../../user/components/membership/parts/Membership');


module.exports = exports = Ext.define('NextThought.app.profiles.community.components.sidebar.parts.Membership', {
	extend: 'NextThought.app.profiles.user.components.membership.parts.Membership',
	alias: 'widget.profile-community-sidebar-memberships',
	cls: 'memberships condensed community',
	profileRouteRoot: '/user',
	SIZE: 35,

	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'entry', 'data-route': '{route}', 'data-qtip': '{name}', cn: [
			'{member:avatar}'
		]
	})),

	renderTpl: Ext.DomHelper.markup([
		{cls: 'see-all', html: 'Members'},
		{cls: 'entries'}
	]),

	renderSelectors: {
		seeAllEl: '.see-all',
		entriesEl: '.entries'
	},

	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.seeAllEl, 'click', this.onSeeAllClick.bind(this));
	},

	updateEntity: function (entity) {
		if (this.activeEntity === entity) {
			return;
		}

		var link = entity.getLink('members');

		this.activeEntity = entity;

		if (!link) {
			this.fillInUsers([]);
			return;
		}

		StoreUtils.loadItems(link, {batchSize: this.SIZE, batchStart: 0})
			.then(function (users) {
				return UserRepository.getUser(users);
			})
			.then(this.fillInUsers.bind(this));
	},

	fillInUsers: function (users) {
		this.removeAll();

		if (!users.length) {
			this.hide();
			return;
		}

		users.map(function (user) {
			return {
				member: user,
				name: user.getName(),
				route: user.getURLPart()
			};
		}).forEach(this.addEntry.bind(this));
	},

	onSeeAllClick: function () {
		if (this.gotoMembership) {
			this.gotoMembership();
		}
	}
});
