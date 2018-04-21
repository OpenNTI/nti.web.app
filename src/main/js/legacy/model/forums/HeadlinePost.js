const Ext = require('@nti/extjs');
require('./Post');


module.exports = exports = Ext.define('NextThought.model.forums.HeadlinePost', {
	extend: 'NextThought.model.forums.Post',

	syncWithResponse (response, silent) {
		let json = JSON.parse(response);
		if (json.headline) {
			response = JSON.stringify(json.headline);
		}

		this.callParent([response, silent]);
	}
});
