const Ext = require('@nti/extjs');
const {default: translate} = require('@nti/lib-locale');

const {getString} = require('legacy/util/Localization');

require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.overrides.XTemplate', {
	override: 'Ext.XTemplate'
});

Ext.override(Ext.XTemplateCompiler, {

	myStringsRe: /\{{3}((?!\{\{\{|\}\}\}).+?\}?)\}{3}/g,

	myReplacementFn: (function () {
		//cache the regex and function so its not creating them on the fly each time
		var escapRe = /(\{|\})/gm;

		function escapeFn (n, c) { return '&#' + c.charCodeAt(0) + ';'; }

		return function (m, key) {
			var def = {},
				s = translate.isMissing(key) ? getString(key, def) : translate(key);
			//Its written like this to prevent executing throwaway work.
			// Only calculate the escaped key if the default token is returend.
			return s !== def ? s : m.replace(escapRe, escapeFn);
		};
	}()),

	parse: function (str) {
		var t = this.myStringsRe.exec(str);
		if (t) {
			str = str.replace(this.myStringsRe, this.myReplacementFn);
		}
		return this.callParent([str]);
	}

});
