Ext.define('NextThought.view.slidedeck.ThreadRoot',{
	extend: 'NextThought.view.annotations.note.Panel',
	alias: 'widget.slidedeck-slide-note',

	root: true,
	rootQuery: 'slidedeck-slide',
	collapsedCls: 'collapsed',

	initComponent: function(){
		this.addCls('slide');
		this.addEvents('beforecollapse','beforeexpand');
		this.enableBubble('beforecollapse','beforeexpand');
		this.callParent(arguments);
	},

	afterRender: function(){

		this.callParent(arguments);

		//Inject a link that shows we have comments

		this.commentsLink = Ext.DomHelper.insertAfter(this.time, {tag: 'a', cls: 'comment-link', html: this.textForCommentLink()}, true);

		this.updateHasChildren();
		this.noteBody.on('click',this.toggleCollapse,this);
		this.collapse();
	},

	addAdditionalRecordListeners: function(record){
		this.mon(record, 'count-updated', this.updateHasChildren, this);
		this.mon(record, 'count-updated', this.updateCommentLink, this);
	},

	removeAdditionalRecordListeners: function(record){
		this.mun(record, 'count-updated', this.updateHasChildren, this);
		this.mon(record, 'count-updated', this.updateCommentLink, this);
	},

	textForCommentLink: function(){
		var commentLinkText = "No Comments",
			replyCount;
		replyCount = this.record.getReplyCount();
		if(replyCount > 0){
			commentLinkText = Ext.String.format('{0} {1}', replyCount, replyCount > 1 ? 'Replies': 'Reply');
		}
		return commentLinkText;
	},

	updateCommentLink: function(){
		this.commentsLink.update(this.textForCommentLink());
	},

	updateHasChildren: function(){
		if(this.record.getReplyCount() > 0){
			this.addCls('hasChildren');
		}
	},

	rootToCountComponentsFrom: function(){
		return this;
	},

	toggleCollapse: function(e){
		e.stopEvent();
		//We need to find all the click handlers in the note panel and make sure they are stopped...other wise this will trigger as well.
		return (this.getTargetEl().hasCls(this.collapsedCls) ? this.expand() : this.collapse()) && false;
	},


	collapse: function(){
		var el = this.getTargetEl();
		if(this.fireEvent('beforecollapse', this, el) !== false){
			this.collapsed = true;
			el.addCls(this.collapsedCls);
			this.addCls(this.collapsedCls);
			this.updateLayout();
		}
	},


	expand: function(){
		var el = this.getTargetEl();
		if(this.fireEvent('beforeexpand', this, el) !== false){
			delete this.collapsed;
			el.removeCls(this.collapsedCls);
			this.removeCls(this.collapsedCls);
			this.updateLayout();
		}
	}
});
