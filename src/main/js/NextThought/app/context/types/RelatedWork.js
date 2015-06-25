Ext.define('NextThought.app.context.types.RelatedWork', {
	
	requires: [
		'NextThought.app.context.components.cards.*'
	],

	statics: {
		type: 'relatedwork',

		canHandle: function(obj) {
			return obj && obj.get && obj.get('Class') === 'RelatedWork';
		}
	},


	constructor: function(config){
		this.callParent(arguments);
		Ext.applyIf(this, config || {});
	},


	parse: function(obj, kind) {
		var cmp = Ext.widget('context-relatedwork-card', {
				type: this.self.type,
				content: obj,
				course: this.course
			});
		
		return cmp;
	}
});
