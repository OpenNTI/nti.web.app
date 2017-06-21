const Ext = require('extjs');

const StateStore = require('../common/state/StateStore');
const Actions = require('../common/state/Actions');


module.exports = exports = Ext.define('NextThought.mixins.State', {
	stateKey: 'default',

	getStateKey: function () {
		return this.STATE_KEY || this['stateKey'];
	},

	__getStateActions: function () {
		this.__StateActions = this.__StateActions || Actions.create();

		return this.__StateActions;
	},

	__getStateStore: function () {
		this.__StateStore = this.__StateStore || StateStore.getInstance();

		return this.__StateStore;
	},

	/**
	 * Return the current state
	 * @return {Object} the current state
	 */
	getCurrentState: function () {
		// let actions = this.__getStateActions();
		let store = this.__getStateStore();
		let key = this.getStateKey();

		return store.getState(key);
	},

	/**
	 * Store the state in local storage
	 * @param {Object} state state to store
	 * @returns {void}
	 */
	setState: function (state) {
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
	applyState: function (state) {}
});
