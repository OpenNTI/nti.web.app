const Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.overrides.app.Controller', {
	override: 'Ext.app.Controller',

	callOnAllControllersWith: function (functionName) {
		var ret,
			args = Array.prototype.slice.call(arguments, 1),
			app = this.getApplication();

		app.controllers.each(function (ctlr) {
			if (Ext.isFunction(ctlr[functionName])) {
				ret = ctlr[functionName].apply(ctlr, args);
				return !ret;
			}
		});

		return ret;
	},


	/**
	 * Much like the above function, this executes a command on each controller that implements it. Expecting
	 * the value returned by each to be a promise or a value.  When all performances are done, the pool promise
	 * will resolve or reject.
	 *
	 * @param {String} functionName -
	 * @param {Array} args Arguments to pass to the functionName
	 * @return {Promise} -
	 */
	performAnd: function (functionName, ...args) {
		var app = this.getApplication();

		function perform (ctlr) {
			var f = ctlr[functionName];
			return (f && typeof f.apply === 'function' && f.apply(ctlr, args)) || undefined;
			//the return value should be a promise to pool on. but if not, the all() function
			// will wrap the value into a promise to meet the interface.
		}

		return Promise.all(app.controllers.items
			.map(perform) //make a new array of promises/values
			.filter(Ext.identityFn)); //filter out falsy entries and pass that to the all()
	}
});
