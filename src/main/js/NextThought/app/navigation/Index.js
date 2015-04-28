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
		if (this.nav_cmp === cmp) { return; }
		Ext.destroy(this.nav_cmp);
		cmp.render(this.navContainerEl);
		this.nav_cmp = cmp;
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
