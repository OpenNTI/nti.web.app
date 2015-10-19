Ext.define('NextThought.mixins.State', {
	state_key: 'default',

	requires: [
		'NextThought.common.state.StateStore',
		'NextThought.common.state.Actions'
	],


	__getStateActions: function() {
		this.__StateActions = this.__StateActions || NextThought.common.state.Actions.create();

		return this.__StateActions;
	},


	__getStateStore: function() {
		this.__StateStore = this.__StateStore || NextThought.common.state.StateStore.getInstance();

		return this.__StateStore;
	},

	/**
	 * Return the current state
	 * @return {Object} the current state
	 */
	getCurrentState: function() {
		var actions = this.__getStateActions(),
			store = this.__getStateStore();

		return store.getState(this.state_key);
	},

	/**
	 * Store the state in local storage
	 * @param {Object} state state to store
	 */
	setState: function(state) {
		var actions = this.__getStateActions();

		actions.setState(this.state_key, state);

		return this.applyState(state);
	},

	/**
	 * Apply a state to the ui, return promise that fulfills when its down
	 * @override
	 * @param {Object} state state to apply
	 */
	applyState: function(state) {}
});
