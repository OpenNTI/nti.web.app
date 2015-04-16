/**
 * TODO: Explain this class.
 *
 * TODO: JSG: Can we get rid of this?  The only injected function definintions seem to be "togglehint" and "NTIPreviousPage"
 * I don't think we use "ToggleHint" anymore...and if we do, that may need to be come "content" scripts...
 * what about previous page?? I would like to dump this concept.
 */
Ext.define('NextThought.view.content.reader.ContentAPIRegistry', {
	singleton: true,
	mixins: {
		observable: 'Ext.util.Observable'
	},

	constructor: function() {
		this.mixins.observable.constructor.call(this);
		this.addEvents('update');
		this.registry = {};
	},


	/**
	 *
	 * @param publicName
	 * @param fn
	 * @param scope
	 */
	register: function(publicName, fn, scope) {
		if (typeof publicName !== 'string') {
			Ext.Error.raise('publicName must be a string');
		}
		else if (!Ext.isFunction(fn)) {
			Ext.Error.raise('fn must be a function');
		}
		else if (this.registry[publicName]) {
			Ext.Error.raise('The function "' + publicName + '" is already registered.');
		}

		this.registry[publicName] = function() { return fn.apply(scope || this, arguments); };
		this.fireEvent('update', this);
	},


	/**
	 *
	 */
	getAPI: function() {
		return Ext.clone(this.registry);
	}


},function() {
	window.ContentAPIRegistry = this;
});
