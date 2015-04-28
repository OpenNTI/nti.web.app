Ext.define('NextThought.overrides.builtins.String', function() {

	function hash(str) {
		var h = 0, i, c;
		if (Ext.isEmpty(str)) {
			return h;
		}

		for (i = 0; i < str.length; i++) {
			c = str.charCodeAt(i);
			h = ((h << 5) - h) + c;
			h = h & h; // Convert to 32bit integer
		}
		return h;
	}

	String.prototype.strcmp = function(s) {
	    if (this < s) { return -1; }
	    if (this > s) { return 1; }
	    return 0;
	};

	function hashMe() { return hash(this); }

	String.prototype.concatPath = function(str) {
		var result = this;
		//ensure the base path ends in a separator...
		if (result.charAt(result.length - 1) !== '/') {
			result += '/';
		}

		//ensure the postfix does not start with a separator...
		if (str && str.charAt(0) === '/') {
			str = str.substr(1);
		}

		//join...
		return result + str;
	};

	String.prototype.hash = hashMe;
	String.hash = hash;

	String.commonPrefix = function commonPrefix(words) {
		var maxWord = words.reduce(function max(a, b) { return a > b ? a : b; }),
			prefix = words.reduce(function min(a, b) { return a > b ? b : a; });

		while (maxWord.indexOf(prefix) !== 0) {
			prefix = prefix.slice(0, -1);
		}

		return prefix;
	};

	return {};
});
