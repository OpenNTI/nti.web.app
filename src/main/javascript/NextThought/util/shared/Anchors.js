/**
 * Should be used if we decide to share code with the app, right now I don't think we are but
 * I'm leaving this here for now in case we want to someday. Delete this if it hasn't been used
 * within a few months.
 */
(function(global, undefined){
	global.NextThought = global.NextThought || {};
	NextThought.util = NextThought.util || {};
	NextThought.util.shared = NextThought.util.shared || {};
	NextThought.util.shared.Anchors = function(){};

	var cls = NextThought.util.shared.Anchors;

	cls.prototype = {
		doSomething: function(){
			return 1;
		}
	};
})(window);