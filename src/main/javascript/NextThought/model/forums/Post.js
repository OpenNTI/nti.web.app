Ext.define('NextThought.model.forums.Post', {
	extend: 'NextThought.model.forums.Base',
	mixins: {
		bodyContent: 'NextThought.mixins.ModelWithBodyContent'
	},

	isPost: true,

	fields: [
		{ name: 'body', type: 'auto' },
		{ name: 'title', type: 'string' }
	],

	getActivityItemConfig: function(){
		var p = new Promise(), result;

		result = {
			message: Ext.String.format('&ldquo;{0}&ldquo;', Ext.String.ellipsis(this.getBodyText(), 50, true)),
			verb: 'commented'
		};

		p.fulfill(result);

		return p;
	}
});
