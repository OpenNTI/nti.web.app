Ext.define('NextThought.common.StateStore', {
	mixins: {
		observable: 'Ext.util.Observable'
	},


	inheritableStatics: {
		__instance: null,

		/**
		 * Either returns or create an instance, so that every thing that uses the
		 * state store is using the same instance.
		 *
		 * @return {Object} an instance of this state store
		 */
		getInstance: function() {
			if (!this.__instance) {
				this.__instance = this.create();
			}

			return this.__instance;
		}
	},


	constructor: function(config) {
		this.callParent(arguments);

		this.mixins.observable.constructor.call(this, config);
	},


	isLoading: function() {
		return this.loading;
	},


	hasLoaded: function() {
		return this.hasFinishedLoad;
	},


	setLoading: function() {
		this.loading = true;
	},


	setLoaded: function() {
		this.loading = false;
		this.hasFinishedLoad = true;
		this.fireEvent('loaded');
	}
});
