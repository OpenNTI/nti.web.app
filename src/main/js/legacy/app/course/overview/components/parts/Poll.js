const Ext = require('@nti/extjs');

require('internal/legacy/common/components/cards/Card');
require('internal/legacy/model/PollRef');

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.parts.Poll',
	{
		extend: 'NextThought.common.components.cards.Card',

		constructor: function () {
			this.callParent(arguments);
		},
	}
);
