var Ext = require('extjs');
var CardsCard = require('../../../../../common/components/cards/Card');
var ModelPollRef = require('../../../../../model/PollRef');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.parts.Poll', {
	extend: 'NextThought.common.components.cards.Card',

	constructor: function() {
		this.callParent(arguments);
	}
});
