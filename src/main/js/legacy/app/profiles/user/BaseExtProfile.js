const Ext = require('@nti/extjs');

const GroupsActions = require('legacy/app/groups/Actions');
const GroupsStateStore = require('legacy/app/groups/StateStore');
const NavigationActions = require('legacy/app/navigation/Actions');
const {isMe} = require('legacy/util/Globals');

require('legacy/mixins/Router');
require('./components/activity/Index');
require('./components/membership/Index');
require('./components/achievements/Index');
require('./components/transcripts/Index');

module.exports = exports = Ext.define('NextThought.app.profiles.user.Base', {
	extend: 'Ext.container.Container',
	alias: 'widget.base-profile-user',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: 'user-profile profile',
	layout: 'none',

	initComponent: function () {
		this.callParent(arguments);

		this.NavActions = NavigationActions.create();
		this.GroupStore = GroupsStateStore.getInstance();
		this.GroupActions = GroupsActions.create();

		this.headerCmp = this.add(this.buildHeaderComponent());

		this.bodyCmp = this.add({
			xtype: 'container',
			layout: 'card'
		});

		this.initRouter();
		this.initRoutes();

		this.finalizeInit();

		this.on({
			'activate': this.onActivate.bind(this),
			'deactivate': this.onDeactivate.bind(this)
		});
	},

	onActivate: function () {
		var active = this.bodyCmp && this.bodyCmp.getLayout().getActiveItem();

		if (active) {
			active.fireEvent('activate');
		}
	},

	onDeactivate: function () {
		var active = this.bodyCmp && this.bodyCmp.getLayout().getActiveItem();

		if (active) {
			active.fireEvent('deactivate');
		}
	},

	getContext: function () {
		return this.activeEntity;
	},


	finalizeInit: function () {
		window.saveProfile = this.saveProfile.bind(this);
	},

	onAddedToParentRouter: function () {
		this.headerCmp.pushRoute = this.pushRoute.bind(this);
	},

	getActiveItem: function () {
		return this.bodyCmp.getLayout().getActiveItem();
	},

	setActiveEntity: function (id, user) {
		var me = this,
			lowerId = id.toLowerCase();


		if (me.activeEntity && (me.activeEntity.get('Username') || '').toLowerCase() === lowerId) {
			me.getUser = Promise.resolve(me.activeEntity);
			me.isMe = isMe(me.activeEntity);
		} else if (user && (user.get('Username') || '').toLowerCase() === lowerId) {
			me.activeEntity = user;
			me.isMe = isMe(me.activeEntity);
			me.getUser = Promise.resolve(user);
		} else {
			me.getUser = this.resolveEntity(id, user);
		}

		return me.getUser;
	},


	getRouteTitle: function () {
		return this.activeEntity.getName();
	},

	setActiveItem: function (xtype) {
		var cmp = this.down(xtype),
			current = this.bodyCmp.getLayout().getActiveItem(cmp);

		if (!cmp) {
			cmp = this.bodyCmp.add(Ext.widget(xtype));

			this.addChildRouter(cmp);
		}

		this.bodyCmp.getLayout().setActiveItem(cmp);

		if (!current && cmp) {
			cmp.fireEvent('activate');
		}

		return cmp;
	}
});
