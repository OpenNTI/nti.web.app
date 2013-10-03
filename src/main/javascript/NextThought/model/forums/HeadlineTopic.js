Ext.define('NextThought.model.forums.HeadlineTopic', {
	extend: 'NextThought.model.forums.Topic',

	fields: [
		{ name: 'headline', type: 'singleItem' },
		{ name: 'GroupingField', mapping: 'Last Modified', type: 'groupByTime', persist: false, affectedBy: 'Last Modified'},
		{ name: 'creatorName', persist: false, type: 'string'}
	],


	getActivityLabel: function() {
		return 'started a discussion:';
	}
});
