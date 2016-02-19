Ext.define('NextThought.app.context.types.Question', {

	requires: [
		'NextThought.app.context.components.Question',
		'NextThought.app.context.components.list.Question',
		'NextThought.app.context.components.cards.Question',
		'NextThought.app.library.Actions'
	],

	statics: {
		type: 'question',

		canHandle: function(obj) {
			return obj instanceof NextThought.model.assessment.Question;
		}
	},

	constructor: function(config) {
		this.callParent(arguments);

		this.container = config.container;
		this.range = config.range;
		this.record = config.contextRecord;
		this.doNavigate = config.doNavigate;
		this.maxWidth = config.maxWidth || 574;

		this.LibraryActions = NextThought.app.library.Actions.create();
	},


	parse: function(question, kind) {
		var me = this,
			container = question.get('ContainerId');

		return Service.getPageInfo(container)
			.then(function(pageInfo) {
				var contentPackage = pageInfo.get('ContentPackageNTIID');

				return me.LibraryActions.findContentPackage(contentPackage);
			})
			.then(function(contentPackage) {
				question.set('ContentRoot', contentPackage.get('root'));

				return me.__parseQuestion(question, kind);
			});
	},


	__parseQuestion: function(question, kind) {
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
