var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.util.CSS', {
	singleton: true,

	getOrMakeSheet: function(id) {
		var sheet = document.getElementById(id);
		if (!sheet) {
			sheet = document.createElement('style');
			sheet.setAttribute('id', id);
			sheet.appendChild(document.createTextNode(''));
			document.getElementsByTagName('head')[0].appendChild(sheet);
		}
		return sheet.sheet;
	},


	getRule: function(sheet, selector) {
		if (Ext.isString(sheet)) {
			sheet = this.getOrMakeSheet(sheet);
		}

		var rules = sheet.cssRules || [],
			newRule = rules.length,
			i = rules.length - 1;

		for (i; i >= 0; i--) {
			if (rules[i].selectorText === selector) {
				return rules[i];
			}
		}

		sheet.insertRule(selector + '{}', newRule);
		return rules[newRule];
	},


	set: function(rule, values, makeImportant) {
		var hyphenated, property, s = rule.style,
			importance = (makeImportant && 'important') || '',
			re = /([A-Z])/g;

		for (property in values) {
			if (values.hasOwnProperty(property)) {
				hyphenated = property.replace(re, '-$1').toLowerCase();
				s.setProperty(hyphenated, values[property], importance);
			}
		}

		//console.debug(rule.cssText);
	}


});
