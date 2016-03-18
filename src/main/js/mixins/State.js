var Ext = require('extjs');
var StateStateStore = require('../common/state/StateStore');
var StateActions = require('../common/state/Actions');


module.exports = exports = Ext.define('NextThought.mixins.State', {
    state_key: 'default',

    getStateKey: function() {
		return this.state_key;
	},

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
			store = this.__getStateStore(),
			key = this.getStateKey();

		return store.getState(key);
	},

    /**
	 * Store the state in local storage
	 * @param {Object} state state to store
	 */
	setState: function(state) {
		var actions = this.__getStateActions(),
			key = this.getStateKey();

		actions.setState(key, state);

		return this.applyState(state);
	},

    /**
	 * Apply a state to the ui, return promise that fulfills when its down
	 * @override
	 * @param {Object} state state to apply
	 */
	applyState: function(state) {}
});
