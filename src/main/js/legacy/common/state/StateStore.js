const Ext = require('extjs');

const AbstractStorage = require('legacy/cache/AbstractStorage');
const {swallow} = require('legacy/util/Globals');

require('legacy/common/StateStore');


module.exports = exports = Ext.define('NextThought.common.state.StateStore', {
	extend: 'NextThought.common.StateStore',

	constructor: function () {
		this.callParent(arguments);

		this.storage = AbstractStorage.getLocalStorage();
	},

	setStateKey: function (key) {
		if (this['state_key']) {
			return;
		}

		this['state_key'] = key;
		this.loaded = true;

		this.getCurrentState();
	},

	getCurrentState: function () {
		if (!this['state_key']) {
			console.error('No key to get current state from');
			return {};
		}

		if (this['current_state']) {
			return this['current_state'];
		}

		//attempt to parse the current state in the local storage
		try {
			this['current_state'] = JSON.parse(this.storage.getItem(this['state_key']));
		} catch (e) {
			swallow(e);
		} finally {
			//if its still null set it to the empty object
			this['current_state'] = this['current_state'] || {};
		}

		return this['current_state'];
	},

	__saveState: function (state) {
		if (!this['state_key']) {
			console.error('No key to set state to', state);
			return;
		}

		this.storage.setItem(this['state_key'], JSON.stringify(state));
	},

	setState: function (key, state) {
		if (!this['state_key']) {
			console.error('No state keys set, dropping set state', key, state);
			return;
		}

		var current = this.getCurrentState();

		current[key] = state;

		this.__saveState(current);
	},

	getState: function (key) {
		if (!this['state_key']) {
			console.error('No state keys set, returning empty state', key);
			return;
		}

		var current = this.getCurrentState();

		return current[key];
	}
});
