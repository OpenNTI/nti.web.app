Ext.define('NextThought.view.account.activity.ForumCommentPreview', {
	extend:'NextThought.view.account.activity.BlogCommentPreview',
	alias: 'widget.activity-preview-GeneralForumComment',

	onClick: function(){
		if(this.fireEvent('before-show-topic', this.container)){
			this.fireEvent('show-topic', this.container, this.record.get('ID'));
		}
	}

});
