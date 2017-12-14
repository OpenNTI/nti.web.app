const Ext = require('extjs');
const {wait} = require('nti-commons');

const IdentityIndex = require('../account/identity/Index');
const NotificationsTab = require('../notifications/Tab');
const SearchBar = require('../search/SearchBar');
const GutterTab = require('../chat/components/gutter/Tab');

const NavigationStateStore = require('./StateStore');

require('legacy/mixins/State');
require('../chat/Index');


module.exports = exports = Ext.define('NextThought.app.navigation.Index', {
	extend: 'Ext.Component',
	alias: 'widget.main-navigation',

	mixins: {
		State: 'NextThought.mixins.State'
	},

	cls: 'main-navigation',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'back-container', cn: [
			{cls: 'branding'},
			{cls: 'back', cn: [
				{ cls: 'icon-remove' }
			]}
		]},
		{cls: 'nav-container'},
		{cls: 'search-container collapsed'},
		{cls: 'icons', cn: [
			{cls: 'chat-notification-container'},
			{cls: 'notification-container'},
			{cls: 'identity-container'}
		]}
	]),

	renderSelectors: {
		brandingEl: '.back-container .branding',
		backEl: '.back-container .back',
		navContainerEl: '.nav-container',
		identityEl: '.identity-container',
		notificationEl: '.notification-container',
		searchEl: '.search-container',
		chatNotifyEl: '.chat-notification-container'
	},

	initComponent: function () {
		this.callParent(arguments);

		this.NavStore = NavigationStateStore.getInstance();

		this.mon(this.NavStore, {
			'update-nav': this.updateNav.bind(this),
			'set-active-content': this.setActiveContent.bind(this)
		});
	},

	__removeNavCmp: function () {
		if (!this.navCmp) {
			return Promise.resolve();
		}

		var me = this;

		me.navCmp.addCls('removing');

		return wait(300)
			.then(function () {
				Ext.destroy(me.navCmp);
				delete me.navCmp;
			});
	},

	__renderNavCmp: function (cmp) {
		var me = this;

		function render (animate) {
			if (animate) {
				cmp.addCls('showing');

				wait(300)
					.then(cmp.removeCls.bind(cmp, 'showing'));
			}

			if (!cmp.rendered && !cmp.rendering) {
				cmp.render(me.navContainerEl);
			}


			me.navCmp = cmp;
			me.resizeNavCmp();
		}

		if (this.navCmp && this.navCmp.xtype === cmp.xtype && this.navCmp.getId() === cmp.getId()) {
			return;
		}

		return this.__removeNavCmp()
			.then(render.bind(null, true));
	},

	updateNav: function (config) {
		if (!this.rendered) {
			this.on('afterrender', this.updateNav.bind(this));
			return;
		}

		if (config && config.cmp) {
			this.__renderNavCmp(config.cmp);
			this.removeCls('no-nav');
			this.addCls('has-nav');
			this.searchCmp.isActive = true;

			if (!this.searchHasContext) {
				this.searchEl.addCls('collapsed');
			}

			this.hasNavCmp = true;
		} else if (config && config.hideNavCmp && this.hasNavCmp) {
			this.addCls('removing-nav');
			this.addCls('no-nav');
			this.removeCls('has-nav');

			wait(300)
				.then(this.removeCls.bind(this, 'removing-nav'));

			this.searchCmp.isActive = false;
			this.searchEl.removeCls('collapsed');
		} else if (config && config.showNavCmp && this.hasNavCmp) {
			this.removeCls('no-nav');
			this.addCls('has-nav');
			this.searchCmp.isActive = true;
			this.searchCmp.addCls('collapsed');
		} else {
			this.addCls('removing-nav');
			this.addCls('no-nav');
			this.removeCls('has-nav');

			this.__removeNavCmp();

			wait(300)
				.then(this.removeCls.bind(this, 'removing-nav'));

			this.searchCmp.isActive = false;

			this.searchEl.removeCls('collapsed');
		}

		if (config && config.onBack) {
			this.onBackOverride = config.onBack;
		} else {
			delete this.onBackOverride;
		}

		if (config && config.hideBranding) {
			this.addCls('hide-branding');
		} else {
			this.removeCls('hide-branding');
		}

		if (config && config.noLibraryLink) {
			this.noLibraryLink = true;
		} else {
			this.noLibraryLink = false;
		}

		if (config && config.darkStyle) {
			this.addCls('dark-nav');
		} else {
			this.removeCls('dark-nav');
		}

		if (config && config.noRouteOnSearch) {
			this.noRouteOnSearch = true;

			if (this.searchCmp) {
				this.searchCmp.noRouteOnSearch = true;
			}
		} else {
			delete this.noRouteOnSearch;

			if (this.searchCmp) {
				delete this.searchCmp.noRouteOnSearch;
			}
		}

		this.resizeNavCmp();
	},

	__removeVendorIcon: function () {
		this.brandingEl.removeCls('custom-vendor');
		this.brandingEl.setStyle({backgroundImage: undefined, width: undefined});
	},

	__setVendorIcon: function (url) {
		const img = new Image();
		const {brandingEl} = this;

		const work = url && new Promise(function (fulfill, reject) {
			img.onload = fulfill;
			img.onerror = reject;
			img.src = url;
		});

		return (work || Promise.reject())
			.then(() => {
				const aspect = img.width / img.height,
					width = aspect * 70;

				brandingEl.addCls('custom-vendor');
				brandingEl.setStyle({backgroundImage: 'url(' + url + ')', width: width + 'px'});
			})
			.catch(() => {
				brandingEl.removeCls('custom-vendor');
				brandingEl.setStyle({backgroundImage: null, width: null});
			});
	},

	setActiveContent: function (bundle) {
		if (!this.rendered) {
			this.on('afterrender', this.setActiveContent.bind(this, bundle));
			return;
		}

		if (!bundle || !bundle.getVendorIconImage) {
			this.__removeVendorIcon();
		} else {
			bundle.getVendorIconImage()
				.then(this.__setVendorIcon.bind(this))
				.catch(this.__removeVendorIcon.bind(this));
		}
	},

	afterRender: function () {
		this.callParent(arguments);

		this.identityCmp = IdentityIndex.create({
			setMenuOpen: this.setState.bind(this, {active: 'identityCmp'}),
			setMenuClosed: this.setState.bind(this, {}),
			pushRootRoute: this.pushRoute.bind(this)
		});

		this.notificationCmp = NotificationsTab.create({
			setMenuOpen: this.setState.bind(this, {active: 'notificationCmp'}),
			setMenuClosed: this.setState.bind(this, {}),
			pushRootRoute: this.pushRoute.bind(this),
			navigateToObject: this.gotoObject.bind(this)
		});

		this.searchCmp = SearchBar.create({
			setMenuOpen: this.setState.bind(this, {active: 'searchCmp'}),
			setMenuClosed: this.setState.bind(this, {}),
			pushRootRoute: this.pushRoute.bind(this),
			onSearchFocus: this.onSearchFocus.bind(this),
			onSearchBlur: this.onSearchBlur.bind(this),
			onSearchAddContext: this.onSearchAddContext.bind(this),
			onSearchRemoveContext: this.onSearchRemoveContext.bind(this),
			noRouteOnSearch: this.noRouteOnSearch,
			containerCmp: this.searchEl
		});

		this.chatCmp = GutterTab.create({
			setMenuOpen: this.setState.bind(this, {active: 'chatTabCmp'}),
			setMenuClosed: this.setState.bind(this, {}),
			pushRootRoute: this.pushRoute.bind(this)
		});

		this.identityCmp.render(this.identityEl);
		this.notificationCmp.render(this.notificationEl);
		this.searchCmp.render(this.searchEl);
		this.chatCmp.render(this.chatNotifyEl);

		this.on('destroy', 'destroy', this.identityCmp);

		this.mon(this.brandingEl, 'click', this.gotoLibrary.bind(this));
		this.mon(this.backEl, 'click', this.goBack.bind(this));
		this.mon(this.searchEl, 'click', this.expandSearch.bind(this));

		Ext.EventManager.onWindowResize(this.onWindowResize.bind(this));
	},

	onWindowResize: function (height, width, fromExpandedSearch) {
		this.resizeNavCmp();
	},

	resizeNavCmp: function () {
		var width = this.navContainerEl.getWidth(),
			bar = Ext.Element.getViewportWidth() - this.brandingEl.getWidth();

		if (this.navCmp && this.navCmp.maybeCollapse) {
			this.navCmp.maybeCollapse(width, bar);
		}
	},

	expandSearch: function (e) {
		this.searchEl.removeCls('collapsed');
		this.searchCmp.focusInput();

		wait()
			.then(this.resizeNavCmp.bind(this));
	},

	goBack: function () {
		var returnPoint = this.NavStore.getReturnPoint();

		if (this.onBackOverride) {
			this.onBackOverride();
			return;
		}

		if (returnPoint) {
			this.pushRootRoute('', returnPoint);
		} else {
			this.pushRootRoute('Library', '/library');
		}
	},

	pushRoute: function () {
		this.pushRootRoute.apply(this, arguments);
	},

	gotoObject: function () {
		this.attemptToNavigateToObject.apply(this, arguments);
	},

	gotoLibrary: function () {
		if (!this.noLibraryLink) {
			this.pushRootRoute('Library', '/library');
		}
	},

	onSearchFocus: function () {
		this.addCls('search-focused');
	},

	onSearchBlur: function () {
		this.removeCls('search-focused');

		if (!this.noRouteOnSearch && this.navCmp && !this.searchHasContext) {
			this.searchEl.addCls('collapsed');
		}
	},


	onSearchAddContext () {
		this.searchEl.removeCls('collapsed');

		wait()
			.then(this.resizeNavCmp.bind(this));

		this.searchHasContext = true;
	},


	onSearchRemoveContext () {
		this.searchHasContext = false;
	},

	/**
	 * Override this method in the state mixin so it doesn't
	 * write the state to local storage. We only want this state
	 * to persist in memory, not across refreshs.
	 * @param {Object} state the state to apply
	 * @returns {void}
	 */
	setState: function (state) {
		return this.applyState(state);
	},

	applyState: function (state) {
		var me = this,
			hide = 'onMenuHide',
			show = 'onMenuShow';

		function showOrHide (name) {
			me[name][state.active === name ? show : hide]();
		}

		showOrHide('identityCmp');
		showOrHide('notificationCmp');
	}
});
