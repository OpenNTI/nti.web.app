Ext.define('NextThought.common.state.StateStore', {
	extend: 'NextThought.common.StateStore',

	setStateKey: function(key) {
		if (this.state_key) {
			console.error('State key already defined');
			return;
		}

		this.state_key;

		this.getCurrentState();
	},


	getCurrentState: function() {
		if (!this.state_key) {
			console.error('No key to get current state from');
			return  {};
		}

		if (!this.current_state) {
			this.current_state = localStorage.getItem(this.state_key);
		}

		return this.current_state;
	},


	__saveState: function(state) {
		if (!this.state_key) {
			console.error('No key to set state to', state);
			return;
		}

		localStorage.setItem(this.state_key, state);
	},


	setState: function(key, state) {
		if (!this.state_key) {
			console.error('No state keys set, dropping set state', key, state);
			return;
		}

		var current = this.getCurrentState();

		current[key] = state;

		this.__saveState(current);
	},


	getState: function(key) {
		if (!this.state_key) {
			console.error('No state keys set, returning empty state', key);
			return;
		}

		var current = this.getCurrentState();

		return current[key];
	}
});
