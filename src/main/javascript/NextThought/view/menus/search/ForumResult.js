Ext.define('NextThought.view.menus.search.ForumResult', {
	extend: 'NextThought.view.menus.search.BlogResult',
	alias: ['widget.search-result-forums-communityheadlinepost'],

	doClicked: function(fragIdx){
		this.fireEvent('click-forum-result', this, fragIdx);
	}
});
