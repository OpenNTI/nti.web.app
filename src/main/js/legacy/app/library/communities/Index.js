const Ext = require('@nti/extjs');

require('legacy/mixins/Router');
require('./components/Page');



module.exports = exports = Ext.define('NextThought.app.library.communities.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.library-communities',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',
	cls: 'library-page',

	items: [{
		xtype: 'box',
		cls: 'title-container',
		autoEl: {cn: [
			{cls: 'home', html: 'Home'},
			{cls: 'title', html: 'Communities'},
			{cls: 'spacer'},
			{cls: 'add-more-link hidden', html: 'Add Courses'}
		]}
	}],

	initComponent: function () {
		this.callParent(arguments);

		this.addRoute('/', this.showCommunities.bind(this));
		this.addDefaultRoute('/');
	},

	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.el, 'click', this.onClick.bind(this));
	},

	loadCommunities: function (force) {
		var me = this;

		me.loadingCmp = me.loadingCmp || me.add({
			xtype: 'box',
			autoEl: {cls: 'loading-mask', cn: {cls: 'load-text', html: 'Loading...'}}
		});

		return Service.getCommunitiesList()
			.then(function (communities) {
				if (me.loadingCmp) {
					me.remove(me.loadingCmp, true);
					delete me.loadingCmp;
				}

				if (!communities.length) {
					return me.showEmptyState();
				}

				if (me.communityPage) {
					if (force) {
						me.communityPage.setItems(communities);
					}
				} else {
					me.communityPage = me.add({
						xtype: 'library-view-community-page',
						communities: communities,
						navigate: me.navigateToCommunity.bind(me)
					});
				}
			});
	},

	showCommunities: function () {
		this.setTitle('Communities');

		return this.loadCommunities();
	},

	showEmptyState: function () {
		if (this.coursePage) {
			this.remove(this.coursePage, true);
			delete this.coursePage;
		}

		this.emptyText = this.emptyText || this.add({
			xtype: 'box',
			autoEl: {cls: 'empty-text', html: 'You don\'t have any communities yet...'}
		});
	},

	navigateToCommunity: function (community, el) {
		var route = community.getProfileUrl();

		if (route) {
			this.pushRootRoute(null, route, {community: community});
		}
	},

	onClick: function (e) {
		if (e.getTarget('.home')) {
			this.pushRootRoute('', '/');
		}
	}
});
