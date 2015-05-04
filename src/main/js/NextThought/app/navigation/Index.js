Ext.define('NextThought.app.navigation.Index', {
	extend: 'Ext.Component',
	alias: 'widget.main-navigation',

	requires: [
		'NextThought.app.navigation.StateStore'
	],

	cls: 'main-navigation',


	renderTpl: Ext.DomHelper.markup([
		{cls: 'nav-container'}
	]),


	renderSelectors: {
		navContainerEl: '.nav-container'
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

		if (config.cmp) {
			this.__renderNavCmp(config.cmp);
		}
	},


	setActiveContent: function(bundle) {}
});
