Ext.define('NextThought.overrides.tab.Panel', {
	override: 'Ext.tab.Panel',

	stateEvents: ['tabchange'],

	applyState: function(state) {
		var t = (state || {}).t || 0;

		try {
			this.getLayout().getActiveItem();
			this.setActiveTab(t);
		}catch (e) {
			console.error(e.stack);
		}

	},

	getState: function() {
		return {t: this.items.indexOf(this.getActiveTab())};
	}
});
