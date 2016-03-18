var Ext = require('extjs');

var Localization =
module.exports = exports = Ext.define('NextThought.util.Localization', {

	formatRe: /\{([^\{]+)\}/g,


	getExternalizedString: function(key, defaultValue, noKey) {
		var v = (window.NTIStrings || {})[key] || defaultValue || (!noKey && key) || '';

		if (v instanceof Array) {
			v = v[Math.floor(Math.random() * 100) % v.length];
		}

		return v;
	},


	formatExternalString: function(key, values, dontUseKey) {
		var string = this.getExternalizedString(key, dontUseKey ? null : key, true);

		if (!values) {
			return string;
		}

		return string.replace(this.formatRe, function(m, i) {
			return values[i] || m;
		});
	},

	pluralizeString: function(count, key, noNum) {
		var forms = (window.NTIStrings.PluralForms || {})[key], i,
			s;

		if (!forms) {
			//console.error('Pluralizing a string we dont have forms for', key, count);
			return this.oldPlural.apply(Ext.util.Format, arguments);
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

		s = forms.forms[i] || key;

		if (noNum) {
			s = s.replace('{#}', '');
			return s.trim();
		}

		if (s === key) {
			return count + ' ' + s;
		}

		return s.replace('{#}', count);
	}

}).create();

window.getString = Localization.getExternalizedString.bind(Localization);
window.getFormattedString = Localization.formatExternalString.bind(Localization);
Localization.oldPlural = Ext.util.Format.plural;
Ext.util.Format.plural = Localization.pluralizeString.bind(Localization);
