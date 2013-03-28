Ext.define('NextThought.view.account.activity.ForumTopicPreview', {
	extend:'NextThought.view.account.activity.BlogPreview',
	alias:'widget.activity-preview-CommunityHeadlineTopic',

	onClick: function(){
		if(this.fireEvent('before-show-topic', this.record)){
			this.fireEvent('show-topic', this.record);
		}
	}

});