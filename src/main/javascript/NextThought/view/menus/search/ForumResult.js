Ext.define('NextThought.view.menus.search.ForumResult', {
	extend: 'NextThought.view.menus.search.BlogResult',
	alias: ['widget.search-result-forums-communityheadlinepost', 'widget.search-result-forums-generalforumcomment'],


	isComment: function(hit) {
		return (/.*?generalforumcomment$/).test(hit.get('TargetMimeType'));
	},


	doClicked: function(fragIdx) {
		var me = this, component;

		function highlight() {
			me.fireEvent('highlight-topic-hit', me, fragIdx, component);
		}

		function action(success, cmp){
			if (success) {
				component = cmp;
				if (cmp.ready) {
					highlight();
				}else {
					me.mon(cmp, {
						'commentReady': highlight,
						'highlight-ready': highlight,
						scope: me
					});
				}
			}
		}

		if (Ext.isEmpty(this.record)) {
			// If we don't have a record that means the record
			// could have been deleted or an error happened on load.
			me.displayNavigationError();
		}

		//if its a comment, get the comment so we can scroll to it in threaded forums
		if (me.isComment(me.hit)) {
			Service.getObject(me.hit.get('NTIID'), function(comment){
				me.fireEvent('show-topic-with-action', me.record, comment, action);
			}, function(){
				console.error('Faild to load comment' + me.hit.get('NTIID'), arguments);
				me.fireEvent('show-topic-with-action', me.record, undefined, action);
			}, me);

			return;
		}

		me.fireEvent('show-topic-with-action', me.record, undefined, action);
	}
});
