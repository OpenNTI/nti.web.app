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
		//Seems like this might be what Ext.util.Bindable is for...
		//Note we want our store in the StoreManager so objects in it interact with
		//objects in other stores.
		this.store = NextThought.store.Blog.create({storeId: 'activity-popout-blog-preview'+guidGenerator()});
		this.store.proxy.url = this.record.getLink('contents');

		this.mon(this.store,{
			scope: this,
			load: this.fillInReplies
		});

		this.store.load();
	},


	fillInReplies: function(store, records){
		if(Ext.isEmpty(records)){ return; }

		this.removeAll(true);
		records = Ext.Array.sort(records, Globals.SortModelsBy('CreatedTime','DESC'));
		this.add(Ext.Array.map(records,function(r){return {record: r};}));
		this.fireEvent('resize');
	},


	showReplies: function(){
		this.callParent(arguments);
		this.buildStore();
	},

	destroy: function(){
		if(this.store){
			this.store.destroyStore();
		}
		this.callParent(arguments);
	}

});


Ext.define('NextThought.view.account.activity.blog.Reply',{
	extend: 'NextThought.view.account.activity.note.Reply',
	alias: 'widget.activity-preview-blog-reply',


	deleteComment: function(){
		this.fireEvent('delete-blog-comment',this.record, this, this.onRecordDestroyed);
	},

	navigateToComment: function(){
		var rec = this.record,
			containerRecord = this.up('[record]') && this.up('[record]').record,
			me = this;
		if(!containerRecord){
			console.warn('could not find the parent record');
			return;
		}

		UserRepository.getUser(containerRecord.get('Creator'), function(user){
			me.fireEvent('navigate-to-blog', user, containerRecord.get('ID'), rec.get('ID'));
		});
	}
});
