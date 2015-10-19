Ext.define('NextThought.app.context.types.RelatedWork', {

	requires: [
		'NextThought.app.context.components.cards.*',
		'NextThought.app.context.components.list.RelatedWork'
	],

	statics: {
		type: 'relatedwork',

		canHandle: function(obj) {
			return obj && obj.get && obj.get('Class') === 'RelatedWork';
		}
	},


	constructor: function(config) {
		this.callParent(arguments);
		Ext.applyIf(this, config || {});
	},


	parse: function(obj, kind) {
		var cmp;
		if (kind === 'card') {
			cmp = {
				xtype: 'context-relatedwork-card',
				type: this.self.type,
				content: obj,
				course: this.course
			};
		} else if (kind === 'list') {
			cmp = Ext.widget('context-relatedwork-list', {
				type: this.self.type,
				content: obj,
				course: this.course,
				record: this.contextRecord
			});
		} else {
			cmp = Ext.widget('context-relatedwork-card', {
				type: this.self.type,
				content: obj,
				course: this.course,
				record: this.contextRecord,
				doNavigate: this.doNavigate
			});
		}
		return cmp;
	}
});
