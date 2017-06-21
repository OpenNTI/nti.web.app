const Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.overrides.builtins.Error', {});


/**
 * Raise an error on a new call stack to not interupt anything,
 * but will get caught by our error reporter (and send us a email)
 *
 * @param {String|Object} msg - message {@see Ext.Error#raise}
 * @returns {void}
 */
Error.raiseForReport = function (msg) {

	var stack = new Error(msg.message || msg.msg || msg).stack;

	setTimeout(function () {
		if (msg instanceof Error) {throw msg.stack || msg.message;}
		Ext.Error.raise(stack);
	},1);
};
