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
	}
});
