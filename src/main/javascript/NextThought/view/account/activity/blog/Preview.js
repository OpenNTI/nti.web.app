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
	},


	buildStore: function(){
		var store = NextThought.store.Blog.create();
		store.proxy.url = this.record.getLink('contents');

		this.mon(store,{
			scope: this,
			load: this.fillInReplies
		});

		store.load();
	},


	fillInReplies: function(store, records){
		if(Ext.isEmpty(records)){ return; }

		this.removeAll(true);
		records = Ext.Array.sort(records, Globals.SortModelsBy('CreatedTime','DESC'));
		this.add(Ext.Array.map(records,function(r){return {record: r};}));
	},


	showReplies: function(){ this.buildStore(); }

});


Ext.define('NextThought.view.account.activity.blog.Reply',{
	extend: 'NextThought.view.account.activity.note.Reply',
	alias: 'widget.activity-preview-blog-reply',


	deleteComment: function(){
		this.fireEvent('delete-blog-comment',this.record, this, this.onRecordDestroyed);
	}
});
