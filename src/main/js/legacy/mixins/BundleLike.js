const Ext = require('extjs');

const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));


module.exports = exports = Ext.define('NextThought.mixins.BundleLike', {


	containsNTIID: function (id) {
		var packs = this.get('ContentPackages') || [],
			prefix = lazy.ParseUtils.ntiidPrefix(id);

		var matches = packs.filter(function (p) {
			return lazy.ParseUtils.ntiidPrefix(p.get('NTIID')) === prefix;
		});

		return matches.length > 0;
	}

});
