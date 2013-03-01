Ext.define('NextThought.model.forums.PersonalBlogEntry', {
	extend: 'NextThought.model.forums.HeadlineTopic',

	fields: [
		{ name: 'publish-state', convert: function(v,r){
			return r.isPublished() ? 'Published':'Draft';
		} }
	],


	isPublished: function(){
		return Boolean(this.getLink('unpublish'));
	},


	publish:function(widget, cb, scope){
		var me = this,
			currentValue = this.isPublished(),
			action = currentValue ? 'unpublish' : 'publish';

		if ((me.activePostTos && me.activePostTos[action]) || me.phantom){return;}

		widget = widget||{};//default it so we don't blow up if no arg is passed

		//We will assume it completes and then update it if it actually fails
		Ext.callback(widget.markAsPublished,widget,[!currentValue]);

		me.postTo(action, function(s){
			Ext.callback(cb,scope||window,s);
			if (!s) {
				Ext.callback(widget.markAsPublished,widget,[currentValue]);
			}
		});

	}
});


