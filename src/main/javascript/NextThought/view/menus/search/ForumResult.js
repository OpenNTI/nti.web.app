Ext.define('NextThought.view.menus.search.ForumResult', {
	extend: 'NextThought.view.menus.search.BlogResult',
	alias: ['widget.search-result-forums-communityheadlinepost', 'widget.search-result-forums-generalforumcomment'],


	isComment: function(hit){
		return (/.*?generalforumcomment$/).test(hit.get('MimeType'));
	},


	doClicked: function(fragIdx){
		if(this.comment){
			this.fireEvent('click-forum-comment', this);
		}
		else{
			this.fireEvent('click-forum-result', this, fragIdx);
		}

	}
});
