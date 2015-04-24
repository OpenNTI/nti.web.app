Ext.define('NextThought.mixins.State', {
	state_key: 'default',

	requires: ['NextThought.common.state.StateStore'],


	__getStateStore: function() {
		this.__StateStore = this.__StateStore || NextThought.common.state.StateStore.getInstance();

		return this.__StateStore;
	},

	/**
	 * Return the current state
	 * @return {Object} the current state
	 */
	getState: function() {
		var store = this.__getStateStore();

		return store.getState(this.state_key);
	},

	/**
	 * Store the state in local storage
	 * @param {Object} state state to store
	 */
	setState: function(state) {
		var store = this.__getStateStore();

		store.setState(this.state_key, state);

		this.applyState(state);
	},

	/**
	 * Apply a state to the ui
	 * @override
	 * @param {Object} state state to apply
	 */
	applyState: function(state) {}
});
