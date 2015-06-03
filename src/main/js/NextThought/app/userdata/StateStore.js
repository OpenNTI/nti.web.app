Ext.define('NextThought.app.userdata.StateStore', {
	extend: 'NextThought.common.StateStore',

	setPreference: function(key, pref) {
		this.page_preference_map = this.page_preference_map || {};

		this.page_preference_map[key] = pref;
	},


	getPreference: function(key) {
		return this.page_preference_map && this.page_preference_map[key];
	}
});
