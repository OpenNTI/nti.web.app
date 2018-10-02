const Ext = require('@nti/extjs');
const {User:userClient} = require('@nti/web-client');
const {User} = require('@nti/web-profiles');

const UserModel = require('legacy/model/User');
const NavigationActions = require('legacy/app/navigation/Actions');

module.exports = exports = Ext.define('NextThought.app.profiles.user.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-user',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},


	cls: '',
	layout: 'none',


	initComponent () {
		this.callParent(arguments);

		this.NavActions = NavigationActions.create();

		this.addDefaultRoute(this.showUser.bind(this));
	},


	async setActiveEntity (id) {
		if (this.activeEntity &&  this.activeEntity.getID() === id) { return; }

		const user = await userClient.resolve({entityId: id});

		this.activeEntity = user;
	},


	showUser () {
		const baseroute = this.getBaseRoute();

		if (this.userView && this.userView.entity === this.activeEntity) {
			this.userView.setBaseRoute(baseroute);
		} else {
			this.userView = this.add({
				xtype: 'react',
				component: User.View,
				entity: this.activeEntity,
				baseroute: this.getBaseRoute()
			});
		}


		this.NavActions.updateNavBar({
			hideBranding: true
		});

		this.NavActions.setActiveContent(UserModel.interfaceToModel(this.activeEntity));

	}
});
