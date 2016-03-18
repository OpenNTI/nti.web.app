var Ext = require('extjs');
var ParseUtils = require('../util/Parsing');


module.exports = exports = Ext.define('NextThought.mixins.BundleLike', {


	containsNTIID: function(id) {
		var packs = this.get('ContentPackages') || [],
			prefix = ParseUtils.ntiidPrefix(id);

		var matches = packs.filter(function(p) {
			return ParseUtils.ntiidPrefix(p.get('NTIID')) === prefix;
		});

		return matches.length > 0;
	}

});
