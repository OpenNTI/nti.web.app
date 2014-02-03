Ext.define('NextThought.overrides.app.Controller', {
	override: 'Ext.app.Controller',

	callOnAllControllersWith: function(functionName) {
		var ret,
			args = Array.prototype.slice.call(arguments, 1),
			app = this.getApplication();

		app.controllers.each(function(ctlr) {
			if (Ext.isFunction(ctlr[functionName])) {
				ret = ctlr[functionName].apply(ctlr, args);
				return !ret;
			}
		});

		return ret;
	}
});
