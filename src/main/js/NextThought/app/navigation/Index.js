export default Ext.define('NextThought.app.navigation.Index', {
	extend: 'Ext.Component',
	alias: 'widget.main-navigation',

	mixins: {
		State: 'NextThought.mixins.State'
	},

	requires: [
		'NextThought.app.navigation.StateStore',
		'NextThought.app.account.identity.Index',
		'NextThought.app.notifications.Tab',
		'NextThought.app.search.SearchBar',
		'NextThought.app.chat.components.gutter.Tab',
		'NextThought.app.chat.Index'
	],

	cls: 'main-navigation',


	renderTpl: Ext.DomHelper.markup([
		{cls: 'back-container', cn: [
			{cls: 'branding'},
			{cls: 'back'}
		]},
		{cls: 'nav-container'},
		{cls: 'search-container'},
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


	initComponent: function() {
		this.callParent(arguments);

		this.NavStore = NextThought.app.navigation.StateStore.getInstance();

		this.mon(this.NavStore, {
			'update-nav': this.updateNav.bind(this),
			'set-active-content': this.setActiveContent.bind(this)
		});
	},


	__removeNavCmp: function() {
		if (!this.nav_cmp) {
			return Promise.resolve();
		}

		var me = this;

		me.nav_cmp.addCls('removing');

		return wait(300)
			.then(function() {
				Ext.destroy(me.nav_cmp);
				delete me.nav_cmp;
			});
	},


	__renderNavCmp: function(cmp) {
		var me = this;

		function render(animate) {
			if (animate) {
				cmp.addCls('showing');

				wait(300)
					.then(cmp.removeCls.bind(cmp, 'showing'));
			}

			cmp.render(me.navContainerEl);

			me.nav_cmp = cmp;
			me.onWindowResize();
		}

		if (this.nav_cmp && this.nav_cmp.xtype === cmp.xtype) {
			return;
		}

		return this.__removeNavCmp()
			.then(render.bind(null, true));
	},

	updateNav: function(config) {
		if (!this.rendered) {
			this.on('afterrender', this.updateNav.bind(this));
			return;
		}

		if (config && config.cmp) {
			this.__renderNavCmp(config.cmp);
			this.removeCls('no-nav');
			this.addCls('has-nav');
			this.searchCmp.isActive = true;
		} else {
			this.addCls('removing-nav');

			this.__removeNavCmp();

			wait(300)
				.then(this.addCls.bind(this, 'no-nav'))
				.then(this.removeCls.bind(this, 'has-nav'))
				.then(this.removeCls.bind(this, 'removing-nav'));

			this.searchCmp.isActive = false;
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

		this.onWindowResize();
	},


	__removeVendorIcon: function() {
		this.brandingEl.removeCls('custom-vendor');
		this.brandingEl.setStyle({backgroundImage: undefined, width: undefined});
	},


	__setVendorIcon: function(url) {
		var img = new Image(),
			brandingEl = this.brandingEl;

		return new Promise(function(fulfill, reject) {
			img.onload = fulfill;
			img.onerror = reject;
			img.src = url;
		}).then(function(i) {
			var aspect = img.width / img.height,
				width = aspect * 70;

			brandingEl.addCls('custom-vendor');
			brandingEl.setStyle({backgroundImage: 'url(' + url + ')', width: width + 'px'});
		});
	},


	setActiveContent: function(bundle) {
		if (!this.rendered) {
			this.on('afterrender', this.setActiveContent.bind(this, bundle));
			return;
		}

		if (!bundle || !bundle.getVendorIconImage) {
			this.__removeVendorIcon();
		} else {
			bundle.getVendorIconImage()
				.then(this.__setVendorIcon.bind(this))
				.fail(this.__removeVendorIcon.bind(this));
		}
	},


	afterRender: function() {
		this.callParent(arguments);

		this.identityCmp = NextThought.app.account.identity.Index.create({
			setMenuOpen: this.setState.bind(this, {active: 'identityCmp'}),
			setMenuClosed: this.setState.bind(this, {}),
			pushRootRoute: this.pushRoute.bind(this)
		});

		this.notificationCmp = NextThought.app.notifications.Tab.create({
			setMenuOpen: this.setState.bind(this, {active: 'notificationCmp'}),
			setMenuClosed: this.setState.bind(this, {}),
			pushRootRoute: this.pushRoute.bind(this),
			navigateToObject: this.gotoObject.bind(this)
		});

		this.searchCmp = NextThought.app.search.SearchBar.create({
			setMenuOpen: this.setState.bind(this, {active: 'searchCmp'}),
			setMenuClosed: this.setState.bind(this, {}),
			pushRootRoute: this.pushRoute.bind(this),
			onSearchFocus: this.onSearchFocus.bind(this),
			onSearchBlur: this.onSearchBlur.bind(this),
			noRouteOnSearch: this.noRouteOnSearch,
			containerCmp: this.searchEl
		});

		this.chatCmp = NextThought.app.chat.components.gutter.Tab.create({
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

		Ext.EventManager.onWindowResize(this.onWindowResize.bind(this));
	},


	onWindowResize: function(height, width) {
		var shouldCollapseSearch = false,
			width = this.navContainerEl.getWidth(),
			bar = Ext.Element.getViewportWidth() - this.brandingEl.getWidth();

		if (this.nav_cmp && this.nav_cmp.maybeCollapse) {
			shouldCollapseSearch = this.nav_cmp.maybeCollapse(width, bar);
		}

		if (shouldCollapseSearch) {
			this.searchEl.addCls('collapsed');
		} else {
			this.searchEl.removeCls('collapsed');
		}
	},


	goBack: function() {
		var returnPoint = this.NavStore.getReturnPoint();

		if (returnPoint) {
			this.pushRootRoute('', returnPoint);
		} else {
			this.pushRootRoute('Library', '/library');
		}
	},


	pushRoute: function() {
		this.pushRootRoute.apply(this, arguments);
	},


	gotoObject: function() {
		this.attemptToNavigateToObject.apply(this, arguments);
	},


	gotoLibrary: function() {
		if (!this.noLibraryLink) {
			this.pushRootRoute('Library', '/library');
		}
	},


	onSearchFocus: function() {
		this.addCls('search-focused');
	},


	onSearchBlur: function() {
		this.removeCls('search-focused');
	},


	/**
	 * Override this method in the state mixin so it doesn't
	 * write the state to local storage. We only want this state
	 * to persist in memory, not across refreshs.
	 * @param {Object} state the state to apply
	 */
	setState: function(state) {
		return this.applyState(state);
	},


	applyState: function(state) {
		var me = this,
			hide = 'onMenuHide',
			show = 'onMenuShow';

		function showOrHide(name) {
			me[name][state.active === name ? show : hide]();
		}

		showOrHide('identityCmp');
		showOrHide('notificationCmp');
	}
});
