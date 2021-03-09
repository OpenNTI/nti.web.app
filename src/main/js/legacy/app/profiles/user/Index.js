const Ext = require('@nti/extjs');
const { User } = require('@nti/web-profiles');
const { isMe } = require('internal/legacy/util/Globals');
const NavigationActions = require('internal/legacy/app/navigation/Actions');
const UserRepository = require('internal/legacy/cache/UserRepository');
const UserModel = require('internal/legacy/model/User');
const PersonalBlog = require('internal/legacy/model/forums/PersonalBlog');
const AnalyticsUtil = require('internal/legacy/util/Analytics');
const SettingsWindow = require('internal/legacy/app/account/settings/Window');

const Header = require('./Tabs');

require('./components/activity/Index');
require('./components/achievements/Index');

module.exports = exports = Ext.define('NextThought.app.profiles.user.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-user',

	mixins: {
		Router: 'NextThought.mixins.Router',
	},

	cls: 'user-profile profile',
	items: [],
	layout: 'none',

	initComponent() {
		this.callParent(arguments);

		this.NavActions = NavigationActions.create();

		this.headerContainer = this.add({
			xtype: 'container',
			layout: 'none',
			items: [],
		});

		this.bodyContainer = this.add({
			xtype: 'container',
			layout: 'none',
			items: [],
		});

		this.initRouter();

		this.addRoute('/edit', this.showEdit.bind(this));
		this.addRoute('/about', this.showAbout.bind(this));
		this.addRoute('/activity', this.showActivity.bind(this));
		this.addRoute('/membership', this.showMembership.bind(this));
		this.addRoute('/achievements', this.showAchievements.bind(this));
		this.addRoute('/transcripts', this.showTranscripts.bind(this));

		this.addDefaultRoute('/about');
	},

	getActiveItem() {
		return this.bodyContainer.items.first();
	},

	onRouteActivate() {
		this.stopCleanup();
	},

	onRouteDeactivate() {
		this.stopResourceViewed();

		this.stopCleanup();
		this.cleanupTimeout = setTimeout(() => {
			this.setActive(null);
		}, 100);
	},

	stopCleanup() {
		clearTimeout(this.cleanupTimeout);
	},

	getContext() {
		return this.activeEntity;
	},

	async setActiveEntity(id) {
		if (
			this.activeEntity &&
			(this.activeEntity.get('Username') || '').toLowerCase() ===
				id.toLowerCase()
		) {
			return;
		}

		const user = await UserRepository.getUser(id, null, null, true);
		const interfaceUser = await user.getInterfaceInstance();

		this.activeEntity = user;
		this.isMe = isMe(user);
		this.interfaceEntity = interfaceUser;

		this.headerContainer.removeAll(true);
		this.headerCmp = this.headerContainer.add({
			xtype: 'react',
			component: Header,
			entity: interfaceUser,
			launchEditor: () => {
				var win = SettingsWindow.create({
					onUserChange: async modifiedUser => {
						await this.interfaceEntity.refresh();

						this.headerCmp.setProps({
							entity: this.interfaceEntity,
						});
					},
				});

				win.show();
				win.center();
			},
			getRouteFor: (obj, context) => {
				if (!obj.isUser) {
					return;
				}

				const base = `/app/user/${UserModel.getUsernameForURL(
					obj.Username
				)}/`;

				if (context === 'about') {
					return base;
				}

				if (context === 'activity') {
					return `${base}activity/`;
				}

				if (context === 'achievements') {
					return `${base}achievements/`;
				}

				if (context === 'memberships') {
					return `${base}membership/`;
				}

				if (context === 'transcripts') {
					return `${base}transcripts/`;
				}

				if (context === 'edit') {
					return `${base}edit/`;
				}
			},
		});

		this.bodyContainer.removeAll(true);
	},

	getRouteTitle: function () {
		return this.activeEntity ? this.activeEntity.getName() : '';
	},

	updateHeader() {
		if (this.headerCmp) {
			this.headerCmp.setBaseRoute(this.getBaseRoute());
		}

		this.NavActions.updateNavBar({
			hideBranding: true,
		});

		this.NavActions.setActiveContent(this.activeEntity);
	},

	getActive(selector) {
		return this.bodyContainer.down(selector);
	},

	setActive(cmp) {
		this.bodyContainer.removeAll(true);

		if (cmp) {
			return this.bodyContainer.add(cmp);
		}
	},

	showEdit() {
		this.updateHeader();
		this.stopCleanup();

		const baseroute = this.getBaseRoute();
		const active = this.getActive('[isEdit]');

		this.setContextualTitle('Edit');

		if (active) {
			active.setBaseRoute(baseroute);
		} else {
			this.setActive({
				xtype: 'react',
				isEdit: true,
				component: User.Edit,
				user: this.interfaceEntity,
				addHistory: true,
				baseroute,
			});
		}
	},

	startResourceViewed: function () {
		var id = this.activeEntity?.getId();

		if (id && !this.hasCurrentTimer) {
			AnalyticsUtil.startEvent(id, {
				type: 'ProfileAboutView',
				rootContextId: this.activeEntity.get('NTIID'),
			});

			this.hasCurrentTimer = true;
		}
	},

	stopResourceViewed: function () {
		var id = this.activeEntity && this.activeEntity.getId();

		if (id && this.hasCurrentTimer) {
			AnalyticsUtil.stopEvent(id, 'ProfileAboutView');
			delete this.hasCurrentTimer;
		}
	},

	setContextualTitle(context) {
		this.setTitle(context + ' - ' + this.activeEntity.get('displayName'));
	},

	showAbout() {
		this.updateHeader();
		this.stopCleanup();

		const baseroute = this.getBaseRoute();
		const active = this.getActive('[isAbout]');

		this.startResourceViewed();

		this.setContextualTitle('About');

		if (active) {
			active.setBaseRoute(baseroute);
		} else {
			this.setActive({
				xtype: 'react',
				isAbout: true,
				component: User.About,
				user: this.interfaceEntity,
				addHistory: true,
				baseroute,
			});
		}
	},

	showActivity(route, subRoute) {
		this.updateHeader();
		this.stopCleanup();

		let cmp = this.getActive('profile-user-activity');

		this.setContextualTitle('Activity');

		if (!cmp) {
			cmp = this.setActive({
				xtype: 'profile-user-activity',
			});

			this.addChildRouter(cmp);
		}

		return cmp
			.userChanged(this.activeEntity, this.isMe)
			.then(cmp.handleRoute.bind(cmp, subRoute, route.precache));
	},

	showMembership(route, subRoute) {
		this.updateHeader();
		this.stopCleanup();

		let cmp = this.getActive('user-profile-membership');

		this.setContextualTitle('Membership');

		if (!cmp) {
			cmp = this.setActive({
				xtype: 'user-profile-membership',
			});
		}

		return cmp
			.userChanged(this.activeEntity, this.isMe)
			.then(cmp.handleRoute.bind(cmp, subRoute, route.precache));
	},

	showAchievements() {
		this.updateHeader();
		this.stopCleanup();

		const baseroute = this.getBaseRoute();
		let cmp = this.getActive('[isAchievements]');

		this.setContextualTitle('Achievements');

		if (!cmp) {
			cmp = this.setActive({
				xtype: 'react',
				isAchievements: true,
				component: User.Achievements,
				entity: this.interfaceEntity,
				addHistory: true,
				baseroute,
			});
		}
	},

	showTranscripts() {
		this.updateHeader();
		this.stopCleanup();

		const baseroute = this.getBaseRoute();
		const active = this.getActive('[isTranscripts]');

		this.setContextualTitle('Transcripts');

		if (active) {
			active.setBaseRoute(baseroute);
		} else {
			this.setActive({
				xtype: 'react',
				isTranscripts: true,
				component: User.Transcripts,
				entity: this.interfaceEntity,
				addHistory: true,
				baseroute,
			});
		}
	},

	getRouteForBlog: function (blog, path) {
		// Select the activity tab.
		return {
			path: '/activity/',
			isFull: true,
		};
	},

	getRouteForPath: function (path, user) {
		var root = path[0],
			subPath = path.slice(1);

		if (root && root instanceof PersonalBlog) {
			return this.getRouteForBlog(root, subPath);
		}

		return {
			path: typeof root === 'string' ? root : '',
			isFull: true,
		};
	},

	// showUser () {
	// 	const baseroute = this.getBaseRoute();

	// 	if (this.userView && this.userView.entity === this.activeEntity) {
	// 		this.userView.setBaseRoute(baseroute);
	// 	} else {
	// 		this.userView = this.add({
	// 			xtype: 'react',
	// 			component: User.View,
	// 			entity: this.activeEntity,
	// 			baseroute: this.getBaseRoute()
	// 		});
	// 	}

	// 	this.NavActions.updateNavBar({
	// 		hideBranding: true
	// 	});

	// 	this.NavActions.setActiveContent(UserModel.interfaceToModel(this.activeEntity));

	// }
});
