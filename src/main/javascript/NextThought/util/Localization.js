Ext.define('NextThought.util.Localization', {
	singleton: true,


	getExternalizedString: function(key, defaultValue, noKey) {
		var v = (window.NTIStrings || {})[key] || defaultValue || (!noKey && key) || '';

		if (v instanceof Array) {
			v = v[Math.floor(Math.random() * 100) % v.length];
		}

		return v;
	}

}, function() {
	window.getString = this.getExternalizedString.bind(this);

	//Ext.util.Format.plural = ;
});
