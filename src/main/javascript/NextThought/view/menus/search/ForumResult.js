Ext.define('NextThought.view.menus.search.ForumResult', {
	extend: 'NextThought.view.menus.search.BlogResult',
	alias: ['widget.search-result-forums-communityheadlinepost', 'widget.search-result-forums-generalforumcomment'],


	isComment: function(hit){
		return (/.*?generalforumcomment$/).test(hit.get('MimeType'));
	},


	doClicked: function(fragIdx){
		var me = this;
		if(Ext.isEmpty(this.record)){
			// If we don't have a record that means the record
			// could have been deleted or an error happened on load.
			this.displayNavigationError();
		}

		if(this.fireEvent('before-show-topic', this.record)){
			this.fireEvent('show-topic', this.record, me.comment ? this.hit.get('ID'): undefined, function(success){
				if(success){
					me.fireEvent('highlight-topic-hit', me, fragIdx);
				}
			});
		}
	}
});
