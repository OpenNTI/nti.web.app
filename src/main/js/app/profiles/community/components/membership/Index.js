export default Ext.define('NextThought.app.profiles.community.components.membership.Index', {
	extend: 'NextThought.app.profiles.user.components.membership.parts.Membership',
	alias: 'widget.profile-community-membership',

	requires: [
		'NextThought.util.Store'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	title: 'Community Members',
	cls: 'memberships full community two-column',
	profileRouteRoot: '/user',

	PAGE_SIZE: 100,

	entryTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'entry', 'data-route': '{route}', cn: [
			'{member:avatar}',
			{cls: 'name', html: '{name}'}
		]
	})),


	renderTpl: Ext.DomHelper.markup([
		{cls: 'title', html: '{title}'},
		{cls: 'entries'},
		{cls: 'loading hidden', html: 'Loading...'},
		{cls: 'error hidden', html: 'There was an error loading members.'},
		{cls: 'load-more hidden', html: 'Load More'}
	]),


	renderSelectors: {
		titleEl: '.title',
		entriesEl: '.entries',
		loadingEl: '.loading',
		errorEl: '.error',
		loadMoreEl: '.load-more'
	},


	initComponent: function() {
		this.callParent(arguments);

		this.initRouter();

		this.addRoute('/', this.showMembership.bind(this));

		this.addDefaultRoute('/');

		this.on({
			'activate': this.startResourceViewed.bind(this),
			'deactivate': this.stopResourceViewed.bind(this)
		});
	},


	startResourceViewed: function() {
		var id = this.activeEntity && this.activeEntity.getId();

		if (id && !this.hasCurrentTimer) {
			AnalyticsUtil.getResourceTimer(id, {
				type: 'profile-membership-viewed',
				ProfileEntity: id
			});

			this.hasCurrentTimer = true;
		}
	},


	stopResourceViewed: function() {
		var id = this.activeEntity && this.activeEntity.getId();

		if (id && this.hasCurrentTimer) {
			AnalyticsUtil.stopResourceTimer(id, 'profile-membership-viewed');
			delete this.hasCurrentTimer;
		}
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.loadMoreEl, 'click', this.onLoadMore.bind(this));
	},


	updateEntity: function(entity) {
		if (!this.rendered) {
			this.on('afterrender', this.updateEntity.bind(this));
			return;
		}

		if (this.activeEntity === entity) {
			return;
		} else {
			this.stopResourceViewed();
		}

		this.membersLink = entity.getLink('members');
		this.activeEntity = entity;
		this.removeAll();
		this.loadPage(1);

		this.startResourceViewed();
	},


	showMembership: function() {
		this.setTitle('Members');
	},


	loadPage: function(page) {
		var params = {
				batchSize: this.PAGE_SIZE,
				batchStart: (page - 1) * this.PAGE_SIZE
			};

		this.showLoading();
		this.currentPage = page;

		StoreUtils.loadBatch(this.membersLink, params)
			.then(this.onBatchLoad.bind(this))
			.fail(this.onBatchError.bind(this));
	},


	onLoadMore: function() {
		if (this.currentPage) {
			this.loadPage(this.currentPage + 1);
		}
	},


	onBatchError: function() {
		this.showError();
	},


	onBatchLoad: function(batch) {
		var nextLink = batch.Links && Service.getLinkFrom(batch.Links, 'batch-next');

		this.removeLoading();
		this.removeError();

		if (batch.ItemCount < this.PAGE_SIZE) {
			this.hideLoadMore();
		} else {
			this.showLoadMore();
		}

		if (batch.ItemCount) {
			this.addMembers(batch.Items);
		}
	},


	showLoadMore: function() {
		this.loadMoreEl.removeCls('hidden');
	},


	hideLoadMore: function() {
		this.loadMoreEl.addCls('hidden');
	},


	showLoading: function() {
		this.loadingEl.removeCls('hidden');
	},


	removeLoading: function() {
		this.loadingEl.addCls('hidden');
	},


	showError: function() {
		this.errorEl.removeCls('hidden');
	},


	removeError: function() {
		this.errorEl.addCls('hidden');
	},


	addMembers: function(members) {
		members = members || [];

		members.map(function(member) {
			return {
				route: member.getURLPart(),
				name: member.getName(),
				member: member
			};
		}).forEach(this.addEntry.bind(this));
	}
});
