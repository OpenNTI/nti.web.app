var Ext = require('extjs');
var MixinsHasLinks = require('../mixins/HasLinks');
var MixinsHasLinks = require('../mixins/HasLinks');
var ConvertersLinks = require('./converters/Links');
var ModelUser = require('./User');
var ProxyRest = require('../proxy/Rest');
var UtilParsing = require('../util/Parsing');


module.exports = exports = Ext.define('NextThought.model.UserPasswordSet', {
    extend: 'Ext.data.Model',

    mixins: {
		hasLinks: 'NextThought.mixins.HasLinks'
	},

    mimeType: 'application/vnd.nextthought.user',
    proxy: { type: 'nti' },

    fields: [
		{ name: 'Links', type: 'links', persist: false, defaultValue: [] },
		{ name: 'old_password', type: 'string' },
		{ name: 'password', type: 'string' }
	],

    save: function(ops) {

		Ext.Ajax.request(Ext.apply({
			url: this.getLink('edit') + '/++fields++password',
			method: 'PUT',
			jsonData: this.getData()
		},ops));

	},

    statics: {
		fromUser: function(user) {
			var u = $AppConfig.userObject;
			if (!u.raw || !u.raw.Links) {
				Ext.Error.raise('No links for userobject', u);
			}
			return this.create({Links: Ext.clone(u.raw.Links)}, user.get('Username'));
		}
	}
});
