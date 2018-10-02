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

// const Ext = require('@nti/extjs');

// const GroupsActions = require('legacy/app/groups/Actions');
// const GroupsStateStore = require('legacy/app/groups/StateStore');
// const NavigationActions = require('legacy/app/navigation/Actions');
// const UserRepository = require('legacy/cache/UserRepository');
// const PersonalBlog = require('legacy/model/forums/PersonalBlog');
// const {getString} = require('legacy/util/Localization');

// require('legacy/mixins/Router');
// require('./components/Header');
// require('./components/activity/Index');
// require('./components/about/Index');
// require('./components/membership/Index');
// require('./components/achievements/Index');
// require('./components/transcripts/Index');

// module.exports = exports = Ext.define('NextThought.app.profiles.user.Index', {
// 	extend: 'Ext.container.Container',
// 	alias: 'widget.profile-user',

// 	mixins: {
// 		Router: 'NextThought.mixins.Router'
// 	},

// 	cls: 'user-profile profile',
// 	layout: 'none',

// 	initComponent: function () {
// 		this.callParent(arguments);

// 		this.NavActions = NavigationActions.create();
// 		this.GroupStore = GroupsStateStore.getInstance();
// 		this.GroupActions = GroupsActions.create();

// 		this.headerCmp = this.add(this.buildHeaderComponent());

// 		this.bodyCmp = this.add({
// 			xtype: 'container',
// 			layout: 'card'
// 		});

// 		this.initRouter();
// 		this.initRoutes();

// 		this.finalizeInit();

// 		this.on({
// 			'activate': this.onActivate.bind(this),
// 			'deactivate': this.onDeactivate.bind(this)
// 		});
// 	},

// 	onActivate: function () {
// 		var active = this.bodyCmp && this.bodyCmp.getLayout().getActiveItem();

// 		if (active) {
// 			active.fireEvent('activate');
// 		}
// 	},

// 	onDeactivate: function () {
// 		var active = this.bodyCmp && this.bodyCmp.getLayout().getActiveItem();

// 		if (active) {
// 			active.fireEvent('deactivate');
// 		}
// 	},

// 	getContext: function () {
// 		return this.activeEntity;
// 	},

// 	initRoutes: function () {
// 		this.addRoute('/about', this.showAbout.bind(this));
// 		this.addRoute('/activity', this.showActivity.bind(this));
// 		this.addRoute('/membership', this.showMembership.bind(this));

// 		if (isFeature('badges')) {
// 			this.addRoute('/achievements', this.showAchievements.bind(this));
// 		}

// 		this.addRoute('/transcripts', this.showTranscripts.bind(this));

// 		this.addDefaultRoute('/about');
// 	},

// 	buildHeaderComponent: function () {
// 		return {
// 			xtype: 'profile-user-header',
// 			saveProfile: this.saveProfile.bind(this),
// 			removeContact: this.removeContact.bind(this),
// 			addContact: this.addContact.bind(this)
// 		};
// 	},

// 	finalizeInit: function () {
// 		window.saveProfile = this.saveProfile.bind(this);
// 	},

// 	onAddedToParentRouter: function () {
// 		this.headerCmp.pushRoute = this.pushRoute.bind(this);
// 	},

// 	getActiveItem: function () {
// 		return this.bodyCmp.getLayout().getActiveItem();
// 	},

// 	setActiveEntity: function (id, user) {
// 		var me = this,
// 			lowerId = id.toLowerCase();


// 		if (me.activeEntity && (me.activeEntity.get('Username') || '').toLowerCase() === lowerId) {
// 			me.getUser = Promise.resolve(me.activeEntity);
// 			me.isMe = isMe(me.activeEntity);
// 		} else if (user && (user.get('Username') || '').toLowerCase() === lowerId) {
// 			me.activeEntity = user;
// 			me.isMe = isMe(me.activeEntity);
// 			me.getUser = Promise.resolve(user);
// 		} else {
// 			me.getUser = this.resolveEntity(id, user);
// 		}

// 		return me.getUser;
// 	},

// 	resolveEntity: function (id, entity) {
// 		var me = this;
// 		return UserRepository.getUser(id, null, null, true)
// 			.then(function (user) {
// 				me.activeEntity = user;

// 				me.isMe = isMe(user);

// 				return user;
// 			});
// 	},

// 	getRouteTitle: function () {
// 		return this.activeEntity.getName();
// 	},

// 	setActiveItem: function (xtype) {
// 		var cmp = this.down(xtype),
// 			current = this.bodyCmp.getLayout().getActiveItem(cmp);

// 		if (!cmp) {
// 			cmp = this.bodyCmp.add(Ext.widget(xtype));

// 			this.addChildRouter(cmp);
// 		}

// 		this.bodyCmp.getLayout().setActiveItem(cmp);

// 		if (!current && cmp) {
// 			cmp.fireEvent('activate');
// 		}

// 		return cmp;
// 	},

// 	setState: function (active) {
// 		var tabs = [],
// 			isContact = this.GroupStore.isContact(this.activeEntity);

// 		this.activeTab = active;

// 		tabs.push({
// 			label: 'About',
// 			route: '/about',
// 			active: active === 'about'
// 		});

// 		tabs.push({
// 			label: 'Activity',
// 			route: '/activity',
// 			active: active === 'activity'
// 		});

// 		if (isFeature('badges')) {
// 			tabs.push({
// 				label: 'Achievements',
// 				route: '/achievements',
// 				active: active === 'achievements'
// 			});
// 		}

// 		tabs.push({
// 			label: 'Memberships',
// 			route: '/membership',
// 			active: active === 'membership'
// 		});

// 		if(this.activeEntity.hasLink('transcript')) {
// 			tabs.push({
// 				label: 'Transcripts',
// 				route: '/transcripts',
// 				active: active === 'transcripts'
// 			});
// 		}

// 		this.headerCmp.updateUser(this.activeEntity, tabs, isContact, this.isMe);

// 		this.NavActions.updateNavBar({
// 			hideBranding: true
// 		});

// 		this.NavActions.setActiveContent(this.activeEntity);
// 	},

// 	showAbout: function (route, subRoute) {
// 		var aboutCmp = this.setActiveItem('profile-user-about'),
// 			headerCmp = this.headerCmp;

// 		this.setState('about');

// 		if (this.isMe) {
// 			this.activeEntity.getSchema()
// 				.then(function (schema) {
// 					aboutCmp.setSchema(schema);
// 					headerCmp.setSchema(schema);
// 				});
// 		}

// 		aboutCmp.setHeaderCmp(headerCmp);
// 		aboutCmp.gotoMembership = this.pushRoute.bind(this, 'Membership', '/membership');

// 		return aboutCmp.userChanged(this.activeEntity, this.isMe)
// 			.then(aboutCmp.handleRoute.bind(aboutCmp, subRoute, route.precache));
// 	},

// 	showActivity: function (route, subRoute) {
// 		var activityCmp = this.setActiveItem('profile-user-activity'),
// 			headerCmp = this.headerCmp;

// 		this.setState('activity');

// 		if (this.isMe) {
// 			this.activeEntity.getSchema()
// 				.then(function (schema) {
// 					headerCmp.setSchema(schema);
// 				});
// 		}


// 		return activityCmp.userChanged(this.activeEntity, this.isMe)
// 			.then(activityCmp.handleRoute.bind(activityCmp, subRoute, route.precache));
// 	},

// 	showMembership: function (route, subRoute) {
// 		var membershipCmp = this.setActiveItem('user-profile-membership'),
// 			headerCmp = this.headerCmp;

// 		this.setState('membership');

// 		if (this.isMe) {
// 			this.activeEntity.getSchema()
// 				.then(function (schema) {
// 					headerCmp.setSchema(schema);
// 				});
// 		}

// 		return membershipCmp.userChanged(this.activeEntity, this.isMe)
// 			.then(membershipCmp.handleRoute.bind(membershipCmp, subRoute, route.precache));
// 	},

// 	showAchievements: function (route, subRoute) {
// 		var achievementsCmp = this.setActiveItem('user-profile-achievements'),
// 			headerCmp = this.headerCmp;

// 		this.setState('achievements');

// 		if (this.isMe) {
// 			this.activeEntity.getSchema()
// 				.then(function (schema) {
// 					headerCmp.setSchema(schema);
// 				});
// 		}

// 		return achievementsCmp.userChanged(this.activeEntity, this.isMe)
// 			.then(achievementsCmp.handleRoute.bind(achievementsCmp, subRoute, route.precache));
// 	},

// 	showTranscripts: function (route, subRoute) {
// 		var transcriptsCmp = this.setActiveItem('user-profile-transcripts'),
// 			headerCmp = this.headerCmp;

// 		this.setState('transcripts');

// 		if (this.isMe) {
// 			this.activeEntity.getSchema()
// 				.then(function (schema) {
// 					headerCmp.setSchema(schema);
// 				});
// 		}

// 		return transcriptsCmp.userChanged(this.activeEntity, this.isMe)
// 			.then(transcriptsCmp.handleRoute.bind(transcriptsCmp, subRoute, route.precache));
// 	},

// 	saveProfile: function () {
// 		if (!this.isMe) { return Promise.resolve(false); }

// 		var aboutCmp = this.bodyCmp.down('profile-user-about');

// 		if (this.bodyCmp.getLayout().getActiveItem() !== aboutCmp) {
// 			return Promise.resolve(false);
// 		}

// 		if (!aboutCmp.validate()) {
// 			return Promise.resolve(true);
// 		}

// 		return aboutCmp.saveEdits();
// 	},

// 	removeContact: function () {
// 		var me = this,
// 			actions = me.GroupActions,
// 			user = me.activeEntity;

// 		Ext.Msg.show({
// 			title: getString('NextThought.view.profiles.outline.View.confirm'),
// 			msg: getString('NextThought.view.profiles.outline.View.warn'),
// 			icon: 'warning-red',
// 			buttons: {
// 				primary: {
// 					text: 'Remove',
// 					cls: 'caution',
// 					handler: function () {
// 						actions.deleteContact(user)
// 							.then(function () {
// 								me.setState(me.activeTab);
// 							})
// 							.catch(function () {
// 								me.setState(me.activeTab);
// 								alert('There was trouble deleting your contact.');
// 							});
// 					}
// 				},
// 				secondary: {
// 					text: 'Cancel'
// 				}
// 			}
// 		});
// 	},

// 	addContact: function () {
// 		var me = this;

// 		me.GroupActions.addContact(me.activeEntity)
// 			.then(function (something) {
// 				me.setState(me.activeTab);
// 			})
// 			.catch(function () {
// 				me.setState(me.activeTab);
// 				alert('There was trouble adding your contact.');
// 			});
// 	},

// 	getRouteForBlog: function (blog, path) {
// 		// Select the activity tab.
// 		return {
// 			path: '/activity/',
// 			isFull: true
// 		};
// 	},

// 	getRouteForPath: function (path, user) {
// 		var root = path[0],
// 			subPath = path.slice(1);

// 		if (root && root instanceof PersonalBlog) {
// 			return this.getRouteForBlog(root, subPath);
// 		}

// 		return {
// 			path: typeof root === 'string' ? root : '',
// 			isFull: true
// 		};
// 	}
// });
