Ext.define('NextThought.app.content.Index', {
	extend: 'Ext.container.Container',
	//Should only be extended
	
	layout: 'card',
	
	requires: [
		'NextThought.app.content.components.Navigation'
	],


	getNavigation: function() {
		if (!this.navigation || this.navigation.destroyed) {
			this.navigation = NextThought.app.content.components.Navigation.create({
				bodyView: this,
			});
		}

		return this.navigation;
	}
});
