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