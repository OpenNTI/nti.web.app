Ext.define('NextThought.view.account.activity.blog.Preview',{
	extend: 'NextThought.view.account.activity.Preview',
	alias: 'widget.activity-preview-personalblogentry',

	requires: [
		'NextThought.view.account.activity.note.Reply'
	],

	defaultType: 'activity-preview-blog-reply',

	toolbarTpl: Ext.DomHelper.markup({ cls: 'thought-label',html: 'Thought'}),


	getCommentCount: function(record){ return record.get('PostCount'); },

	navigateToItem: function(){
		var me = this, rec = this.record;
		UserRepository.getUser(rec.get('Creator'), function(user){
			me.fireEvent('navigate-to-blog', user, rec.get('ID'));
		});
	},


	beforeRender: function(){
		this.callParent(arguments);
		this.record.get('headline').compileBodyContent(this.setBody,this, null, this.self.WhiteboardSize);
		//Load the last comment or the this.record.focusRecord (if its set)
		if(this.record.focusRecord){
			this.add({record: this.record.focusRecord});
		}
	}

});


Ext.define('NextThought.view.account.activity.blog.Reply',{
	extend: 'NextThought.view.account.activity.note.Reply',
	alias: 'widget.activity-preview-blog-reply'
});
