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
	}

});


Ext.define('NextThought.view.account.activity.topic.Reply',{
	extend: 'NextThought.view.account.activity.note.Reply',
	alias: 'widget.activity-preview-topic-reply'
});
