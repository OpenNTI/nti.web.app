const Ext = require('@nti/extjs');

const LibraryActions = require('legacy/app/library/Actions');
const Poll = require('legacy/model/assessment/Poll');

require('../components/Question');
require('../components/list/Question');
require('../components/cards/Question');

module.exports = exports = Ext.define('NextThought.app.context.types.Poll', {
	statics: {
		type: 'poll',

		canHandle: function (obj) {
			return obj instanceof Poll;
		},
	},

	constructor: function (config) {
		this.callParent(arguments);

		this.container = config.container;
		this.range = config.range;
		this.record = config.contextRecord;
		this.doNavigate = config.doNavigate;
		this.maxWidth = config.maxWidth || 574;

		this.LibraryActions = LibraryActions.create();
	},

	parse: function (poll, kind) {
		var cmp;

		if (kind === 'card') {
			cmp = {
				xtype: 'question-context-card',
				type: this.self.type,
				question: poll,
				record: this.record,
			};
		} else if (kind === 'list') {
			cmp = Ext.widget('question-context-list', {
				type: this.self.type,
				question: poll,
				record: this.record,
			});
		} else {
			cmp = Ext.widget('question-context', {
				type: this.self.type,
				question: poll,
				doNavigate: this.doNavigate,
				record: this.record,
			});
		}

		return cmp;
	},
});
