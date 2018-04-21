const Ext = require('@nti/extjs');

require('legacy/common/components/cards/Card');
require('legacy/model/PollRef');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.parts.Poll', {
	extend: 'NextThought.common.components.cards.Card',

	constructor: function () {
		this.callParent(arguments);
	}
});
