Ext.define('NextThought.view.content.PageWidgets',{
	extend: 'Ext.Component',
	alias: 'widget.content-page-widgets',
	ui: 'content-page-widgets',

	cls: 'content-page-widgets',


	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'meta',
			cn: [{
				cls: 'controls',
				cn: [{ cls: 'favorite' }//,
					//    { cls: 'like' }
				]
			}]
		}
	]),


	renderSelectors: {
		meta: '.meta',
		favorite: '.meta .controls .favorite',
		like: '.meta .controls .like'
	},


	listeners: {
		favorite:{'click':'onFavoriteClick'}
	},


	onBookmark: function(r){
		var favStore = Ext.getStore('favoriteStore'),
			currentNTIID = this.reader.getLocation().NTIID,
			found;



		if(currentNTIID !== r.get('ContainerId')){
			console.error('Got a bookmark', r, 'but we are on page', currentNTIID);
			return;
		}

		this.bookmarkModel = r;
		this.favorite.addCls('on');

		if (favStore) {
			found = favStore.findRecord('NTIID', this.bookmarkModel.get('NTIID'), 0, false, false, true);
			//undo fancy URLbuilding hack where favorites are set at highlights to fins an accepts that works.
			this.bookmarkModel.mimeType = 'application/vnd.nextthought.bookmark';
			if (!found){favStore.insert(0, this.bookmarkModel);}
		}
	},


	onFavoriteClick: function(){
		var favStore = Ext.getStore('favoriteStore'), found;
		if (this.bookmarkModel) {
			//currently have a bookmark here, delete it.
			if (this.bookmarkModel){
				if (favStore) {
					found = favStore.findRecord('NTIID', this.bookmarkModel.get('NTIID'), 0, false, false, true);
					if (found){favStore.remove(found);}
				}
			}
			this.bookmarkModel.destroy();
			this.clearBookmark();
			return;
		}
		//if we are here, it's just creating a new one...
		this.fireEvent('save-new-bookmark', this.reader);
	},


	clearBookmark: function(){
		this.favorite.removeCls('on');
		delete this.bookmarkModel;
	},


	hideControls: function(){ this.hide(); },
	showControls: function(){ this.show(); }
});
