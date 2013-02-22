Ext.define('NextThought.model.forums.StoryTopic', {
	extend: 'NextThought.model.forums.Topic',

	fields: [
		{ name: 'story', type: 'singleItem', persist: false }
	]
});
