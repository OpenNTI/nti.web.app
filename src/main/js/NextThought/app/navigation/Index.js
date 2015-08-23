Ext.define('NextThought.app.navigation.Index', {
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
		{cls: 'identity-container'},
		{cls: 'notification-container'},
		{cls: 'chat-notification-container'},
		{cls: 'search-container'}
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
			'set-active-content': this.setActiveContent.bind(this),
			'show-chat-tab': this.maybeShowChatTab.bind(this)
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
		}

		if (this.nav_cmp && this.nav_cmp.xtype === cmp.xtype) {
			return;
		}

		this.__removeNavCmp()
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
			this.searchCmp.isActive = true;
		} else {
			this.__removeNavCmp();
			this.addCls('no-nav');
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
	},


	setActiveContent: function(bundle) {},


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
			noRouteOnSearch: this.noRouteOnSearch
		});

		this.identityCmp.render(this.identityEl);
		this.notificationCmp.render(this.notificationEl);
		this.searchCmp.render(this.searchEl);

		this.on('destroy', 'destroy', this.identityCmp);

		this.mon(this.brandingEl, 'click', this.gotoLibrary.bind(this));
		this.mon(this.backEl, 'click', this.goBack.bind(this));
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


	maybeShowChatTab: function() {
		var viewportWidth = Ext.Element.getViewportWidth(),
			minViewportWidth = NextThought.app.chat.Index.MIN_VIEWPORT_WIDTH;

		if (viewportWidth <= minViewportWidth && !this.hasCls('has-chat-tab')) {
			this.showChatTab();
		}
		else if (viewportWidth > minViewportWidth && this.hasCls('has-chat-tab')) {
			this.hideChatTab();
		}
	},


	showChatTab: function() {
		var me = this;

		if (!this.chatTabCmp) {
			this.chatTabCmp = NextThought.app.chat.components.gutter.Tab.create({
				setMenuOpen: this.setState.bind(this, {active: 'chatTabCmp'}),
				setMenuClosed: this.setState.bind(this, {}),
				pushRootRoute: this.pushRoute.bind(this),
				renderTo: this.chatNotifyEl
			});
		}

		this.addCls('has-chat-tab');
		wait()
			.then(function() {
				var gutterContainer = Ext.getCmp('chat-window'),
					gutterWin = gutterContainer && gutterContainer.gutterWin,
					listWin = gutterContainer.listWin && gutterContainer.listWin;

				if ((gutterWin && gutterWin.isVisible()) || (listWin && listWin.isVisible())) {
					me.chatTabCmp.addCls('gutter-showing');
				}
				else {
					me.chatTabCmp.removeCls('gutter-showing');
				}
			});
	},


	hideChatTab: function() {
		this.removeCls('has-chat-tab');
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
