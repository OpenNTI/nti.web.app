export default Ext.define('NextThought.app.contentviewer.components.PageWidgets', {
	extend: 'Ext.Component',
	alias: 'widget.content-page-widgets',
	ui: 'content-page-widgets',

	cls: 'content-page-widgets',


	requires: [
		'NextThought.app.userdata.Actions'
	],


	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'meta',
			cn: [
				{
					cls: 'controls',
					cn: [
						{ cls: 'favorite' }//,
						//    { cls: 'like' }
					]
				}
			]
		}
	]),


	renderSelectors: {
		meta: '.meta',
		favorite: '.meta .controls .favorite',
		like: '.meta .controls .like'
	},


	listeners: {
		favorite: {'click': 'onFavoriteClick'}
	},


	onBookmark: function(r) {
		var currentNTIID = this.reader.getLocation().NTIID;


		if (currentNTIID !== r.get('ContainerId')) {
			console.error('Got a bookmark', r, 'but we are on page', currentNTIID);
			return;
		}

		this.bookmarkModel = r;
		this.favorite.addCls('on');
	},


	onFavoriteClick: function() {
		if (this.bookmarkModel) {
			this.bookmarkModel.destroy();
			this.clearBookmark();
			return;
		}

		var actions = NextThought.app.userdata.Actions.create(),
			location = this.reader.getLocation();

		actions.saveNewBookmark(location.NTIID)
			.then(this.onBookmark.bind(this));
	},


	clearBookmark: function() {
		this.favorite.removeCls('on');
		delete this.bookmarkModel;
	},


	hideControls: function() {
		this.hide();
	},


	showControls: function() {
		this.show();
	}
});
