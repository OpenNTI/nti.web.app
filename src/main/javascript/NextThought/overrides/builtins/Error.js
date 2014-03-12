Ext.define('NextThought.overrides.builtins.Error', {});


/**
 * Raise an error on a new call stack to not interupt anything,
 * but will get caught by our error reporter (and send us a email)
 *
 * @param {String|Object} msg - message {@see Ext.Error#raise}
 */
Error.raiseForReport = function(msg) {
	setTimeout(function() {
		if (msg instanceof Error) {throw msg;}
		Ext.Error.raise(msg);
	},1);
};

