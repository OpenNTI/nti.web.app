Ext.define('NextThought.app.navigation.Index', {
	extend: 'Ext.Component',
	alias: 'widget.main-navigation',

	requires: [
		'NextThought.app.navigation.StateStore'
	],

	cls: 'main-navigation',

	renderTpl: Ext.DomHelper.markup({html: 'nav'}),


	initComponent: function() {
		this.callParent(arguments);

		this.NavStore = NextThought.app.navigation.StateStore.getInstance();

		this.mon(this.NavStore, {
			'set-tabs': this.setTabs.bind(this),
			'set-active-content': this.setActiveContent.bind(this)
		});
	},


	setTabs: function(tabs) {},


	setActiveContent: function(bundle) {}
});
