Ext.define('NextThought.model.forums.HeadlineTopic', {
	extend: 'NextThought.model.forums.Topic',

	fields: [
		{ name: 'headline', type: 'singleItem', persist: false },//it is persist, we just don't want to send it with the container.
		{ name: 'GroupingField', mapping: 'Last Modified', type: 'groupByTime', persist: false, affectedBy: 'Last Modified'},
		{ name: 'creatorName', persist: false, type: 'string'}
	],


	getActivityLabel: function() {
		return 'started a discussion:';
	},

	getActivityItemConfig: function(){
		var p = new Promise(), result;

		result = {
			message: Ext.String.ellipsis(this.get('headline').get('title'), 50, true),
			verb: this.getActivityLabel()
		};

		p.fulfill(result);

		return p;
	}
});
