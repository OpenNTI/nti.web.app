const Ext = require('extjs');

require('legacy/common/components/cards/Card');
require('legacy/model/ExternalToolAsset');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.parts.ExternalToolAsset', {
	extend: 'NextThought.common.components.cards.Card',

	constructor: function () {
		this.callParent(arguments);

	}

});
