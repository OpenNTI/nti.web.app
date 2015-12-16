Ext.define('NextThought.model.courses.overview.Lesson', {
	extend: 'NextThought.model.Base',

	mixins: {
		OrderedContents: 'NextThought.mixins.OrderedContents',
		MovingRoot: 'NextThought.mixins.MovingRoot'
	},

	statics: {
		mimeType: 'application/vnd.nextthought.ntilessonoverview'
	},

	mimeType: 'application/vnd.nextthought.ntilessonoverview',

	fields: [
		{name: 'title', type: 'String'},
		{name: 'Items', type: 'arrayItem'},
		{name: 'publishBeginning', type: 'auto'},
		{name: 'publishEnding', type: 'auto'},
		{name: 'PublicationState', type: 'string'}
	],


	getTitle: function() {
		return this.get('title');
	},


	isPublished: function(){
		var state = this.get('PublicationState') || "";
		return state.toLowerCase() === 'DefaultPublished'.toLowerCase();
	}
});
