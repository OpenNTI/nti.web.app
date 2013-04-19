Ext.define('NextThought.view.account.activity.topic.Preview',{
	extend: 'NextThought.view.account.activity.Preview',
	alias: 'widget.activity-preview-topic',

	requires: [
		'NextThought.mixins.forum-feature.Path',
		'NextThought.view.account.activity.note.Reply'
	],

	mixins: {
		forumPath: 'NextThought.mixins.forum-feature.Path'
	},

	renderSelectors: {
		pathEl: '.path'
	},

	defaultType: 'activity-preview-topic-reply',

	toolbarTpl: Ext.DomHelper.markup({ cls: 'path'}),


	getCommentCount: function(record){
		return record.get('PostCount');
	},


	buildStore: function(){
		this.store = NextThought.store.NTI.create({
			storeId: 'activity-popout-topic-preview'+guidGenerator(),
			url: this.record.getLink('contents')
		});

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
		this.fireEvent('realign');
	},


	showReplies: function(){
		this.callParent(arguments);
		this.buildStore();
	},


	navigateToItem: function(){
		if(this.fireEvent('before-show-topic', this.record)){
			this.fireEvent('show-topic', this.record);
		}
	},


	beforeRender: function(){
		this.callParent(arguments);
		this.record.get('headline').compileBodyContent(this.setBody,this, null, this.self.WhiteboardSize);
		this.fillInPath();
		//Load the last comment or the this.record.focusRecord (if its set)
		if(this.record.focusRecord){
			this.add({record: this.record.focusRecord});
		}
	},

	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.pathEl, 'click', this.navigateToItem, this);
	},

	destroy: function(){
		if(this.store){
			this.store.destroyStore();
		}
		this.callParent(arguments);
	}

});


Ext.define('NextThought.view.account.activity.topic.Reply',{
	extend: 'NextThought.view.account.activity.note.Reply',
	alias: 'widget.activity-preview-topic-reply',


	deleteComment: function(){
		this.fireEvent('delete-topic-comment',this.record, this);
	},

	navigateToComment: function(){
		var me = this,
			rec = this.record,
			r = this.up('[record]') && this.up('[record]').record,
			cid = rec.get('ID');

		if(!r){
			console.warn('could not find the parent record');
			return;
		}

		if(me.fireEvent('before-show-topic', r)){
			me.fireEvent('show-topic', r, cid);
		}
	},

	handleDestroy: function(){
		//First remove the delete and edit link listeners followed by the els
		if( this.deleteEl ){
			this.mun(this.deleteEl,'click',this.onDeletePost,this);
			this.deleteEl.remove();
		}

		if( this.editEl ){
			this.mun(this.editEl,'click',this.onEditPost,this);
			this.editEl.remove();
		}

		//Now tear down like and favorites
		this.tearDownLikeAndFavorite();


		//Now clear the rest of our field listeners
		this.record.removeObserverForField(this, 'body', this.updateContent, this);

		//Now update the body to the same text the server uses.
		this.bodyEl.update('This object has been removed.');
		this.addCls('deleted');
	}
});
