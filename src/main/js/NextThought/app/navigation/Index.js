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
		'NextThought.app.navigation.components.Default'
	],

	cls: 'main-navigation',


	renderTpl: Ext.DomHelper.markup([
		{cls: 'nav-container'},
		{cls: 'identity-container'},
		{cls: 'notification-container'}
	]),


	renderSelectors: {
		navContainerEl: '.nav-container',
		identityEl: '.identity-container',
		notificationEl: '.notification-container'
	},


	initComponent: function() {
		this.callParent(arguments);

		this.NavStore = NextThought.app.navigation.StateStore.getInstance();

		this.mon(this.NavStore, {
			'update-nav': this.updateNav.bind(this),
			'set-active-content': this.setActiveContent.bind(this)
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

		if (this.nav_cmp) {
			this.nav_cmp.addCls('removing');
			wait(300)
				.then(function() {
					me.nav_cmp.destroyed = true;
					Ext.destroy(me.nav_cmp);
				})
				.then(render.bind(null, true));
		} else {
			render(true);
		}
	},

	updateNav: function(config) {
		if (!this.rendered) {
			this.on('afterrender', this.updateNav.bind(this));
			return;
		}

		if (config && config.cmp) {
			this.__renderNavCmp(config.cmp);
		} else {
			this.__renderNavCmp(NextThought.app.navigation.components.Default.create({
				gotoLibrary: this.gotoLibrary.bind(this)
			}));
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
			pushRootRoute: this.pushRoute.bind(this)
		});

		this.identityCmp.render(this.identityEl);
		this.notificationCmp.render(this.notificationEl);

		this.on('destroy', 'destroy', this.identityCmp);
	},


	pushRoute: function() {
		this.pushRootRoute.apply(this, arguments);
	},


	gotoLibrary: function() {
		this.pushRootRoute('Library', '/library');
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
