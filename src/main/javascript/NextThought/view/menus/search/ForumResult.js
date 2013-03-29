Ext.define('NextThought.view.menus.search.ForumResult', {
	extend: 'NextThought.view.menus.search.BlogResult',
	alias: ['widget.search-result-forums-communityheadlinepost', 'widget.search-result-forums-generalforumcomment'],


	isComment: function(hit){
		return (/.*?generalforumcomment$/).test(hit.get('MimeType'));
	},


	doClicked: function(fragIdx){
		var me = this;
		if(this.fireEvent('before-show-topic', this.record)){
			this.fireEvent('show-topic', this.record, me.comment ? this.hit.get('ID'): undefined, function(success){
				if(success){
					me.fireEvent('highlight-topic-hit', me, fragIdx);
				}
			});
		}
	}
});
