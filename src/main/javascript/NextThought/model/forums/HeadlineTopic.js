Ext.define('NextThought.model.forums.HeadlineTopic', {
	extend: 'NextThought.model.forums.Topic',

	fields: [
		{ name: 'headline', type: 'singleItem' },
		{ name: 'GroupingField', mapping: 'Last Modified', type: 'groupByTime', persist: false}
	]
});
