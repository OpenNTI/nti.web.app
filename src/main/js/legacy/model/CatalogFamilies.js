var Ext = require('extjs');
var ModelBase = require('./Base');
var ModelCatalogFamily = require('./CatalogFamily');


module.exports = exports = Ext.define('NextThought.model.CatalogFamilies', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Items', type: 'arrayItem'}
	],

	/**
	 * Whether or not a family is in the Items
	 * @param  {CatalogFamily|String} familyOrId id or or the CatalogFamily itself
	 * @return {Boolean}			  whether or not the family is in my list
	 */
	containsFamily: function(familyOrId) {
		if (!familyOrId) { return false; }

		var items = this.get('Items'),
			familyId = typeof familyOrId === 'string' ? familyOrId : familyOrId.get('CatalogFamilyID');

		return items.reduce(function(acc, family) {
			if (family.get('CatalogFamilyID') === familyId) {
				acc = true;
			}

			return acc;
		}, false);
	},

	hasInstersectionWith: function(families) {
		if (!families) { return false; }

		var me = this;
			items = families.get('Items');

		return items.reduce(function(acc, family) {
			if (me.containsFamily(family)) {
				acc = true;
			}

			return acc;
		}, false);
	},

	getFamilyIds: function() {
		var items = this.get('Items');

		return items.map(function(family) {
			return family.get('CatalogFamilyID');
		});
	}
});
