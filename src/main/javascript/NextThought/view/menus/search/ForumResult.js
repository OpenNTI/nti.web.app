Ext.define('NextThought.view.menus.search.ForumResult', {
	extend: 'NextThought.view.menus.search.BlogResult',
	alias: ['widget.search-result-forums-communityheadlinepost', 'widget.search-result-forums-generalforumcomment'],


	isComment: function(hit) {
		return (/.*?generalforumcomment$/).test(hit.get('MimeType'));
	},


	doClicked: function(fragIdx) {
		var me = this;

		function highlight() {
			me.fireEvent('highlight-topic-hit', me, fragIdx, cmp);
		}

		if (Ext.isEmpty(this.record)) {
			// If we don't have a record that means the record
			// could have been deleted or an error happened on load.
			this.displayNavigationError();
		}

		this.fireEvent('show-topic-with-action', this.record, me.comment ? this.hit.get('ID') : undefined, function(success, cmp) {
			if (success) {
				if (cmp.ready) {
					highlight();
				}else {
					me.mon(cmp, 'commentReady', highlight, me);
				}
			}
		});
	}
});
