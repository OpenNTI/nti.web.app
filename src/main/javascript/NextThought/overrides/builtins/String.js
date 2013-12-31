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

	String.prototype.hash = hashMe;
	String.hash = hash;
	return {};
});
