const Ext = require('@nti/extjs');

const LibraryActions = require('legacy/app/library/Actions');
const Question = require('legacy/model/assessment/Question');

require('../components/Question');
require('../components/list/Question');
require('../components/cards/Question');


module.exports = exports = Ext.define('NextThought.app.context.types.Question', {
	statics: {
		type: 'question',

		canHandle: function (obj) {
			return obj instanceof Question;
		}
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

	parse: function (question, kind) {
		var me = this,
			container = question.get('ContainerId');

		return Service.getPageInfo(container)
			.then(function (pageInfo) {
				var contentPackage = pageInfo.get('ContentPackageNTIID');

				return Service.getObject(contentPackage);
			})
			.then(function (contentPackage) {
				question.set('ContentRoot', contentPackage.get('root'));

				return me.__parseQuestion(question, kind);
			});
	},

	__parseQuestion: function (question, kind) {
		var cmp;

		if (kind === 'card') {
			cmp = {
				xtype: 'question-context-card',
				type: this.self.type,
				question: question,
				record: this.record
			};
		} else if (kind === 'list') {
			cmp = Ext.widget('question-context-list', {
				type: this.self.type,
				question: question,
				record: this.record
			});
		} else {
			cmp = Ext.widget('question-context', {
				type: this.self.type,
				question: question,
				doNavigate: this.doNavigate,
				record: this.record
			});
		}

		return cmp;
	}
});
