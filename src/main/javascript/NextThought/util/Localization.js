Ext.define('NextThought.util.Localization', {
	singleton: true,

	formatRe: /\{([^\{]+)\}/g,


	getExternalizedString: function(key, defaultValue, noKey) {
		var v = (window.NTIStrings || {})[key] || defaultValue || (!noKey && key) || '';

		if (v instanceof Array) {
			v = v[Math.floor(Math.random() * 100) % v.length];
		}

		return v;
	},


	formatExternalString: function(key, values) {
		var string = this.getExternalizedString(key, key);

		if (!values) {
			return string;
		}

		return string.replace(this.formatRe, function(m, i) {
			return values[i] || m;
		});
	},

	pluralizeString: function(count, key) {
		var forms = window.NTIStrings.PluralForms[key], i;

		if (!forms) {
			console.error('Pluralizing a string we dont have forms for', key, count);
			return key;
		}

		if (forms.rule) {
			i = forms.rule(count);
		} else {
			i = forms.ranges[count];
			i = i !== undefined ? i : forms.ranges[undefined];
		}

		if (i === undefined) {
			console.error('No form for count', key, count);
			return key;
		}

		return forms.forms[i] || key;
	}

}, function() {
	window.getString = this.getExternalizedString.bind(this);
	window.getFormattedString = this.formatExternalString.bind(this);

	//this.oldPlural = Ext.util.Forumat.plural;

	//Ext.util.Format.plural = ;
});
