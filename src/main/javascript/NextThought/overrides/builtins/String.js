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

	function hashMe() { return hash(this); }

	String.prototype.hash = hashMe;
	String.hash = hash;
	return {};
});
