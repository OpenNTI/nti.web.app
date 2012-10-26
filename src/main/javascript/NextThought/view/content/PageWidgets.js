Ext.define('NextThought.view.content.PageWidgets',{
	extend: 'Ext.container.Container',
	alias: 'widget.content-page-widgets',
	ui: 'content-page-widgets',

	layout: {
		type: 'hbox',
		pack: 'end'
	},


	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'meta',
			cn: [{
				cls: 'controls',
				cn: [{ cls: 'favorite' }//,
                //    { cls: 'like' }
                ]
			}]
		},'{%this.renderContainer(out,values)%}'
	]),


	renderSelectors: {
		meta: '.meta',
		favorite: '.meta .controls .favorite',
		like: '.meta .controls .like'
	},

	initComponent: function(){
		this.callParent(arguments);

		LocationProvider.on('navigateComplete',this.clearBookmark, this);
        NextThought.model.events.Bus.on('bookmark-loaded', this.onBookmark, this);
	},


    onBookmark: function(r){
        var favStore = Ext.getStore('favoriteStore'), found;

        if(LocationProvider.currentNTIID !== r.get('ContainerId')){
            console.error('Got a bookmark', r, 'but we are on page', LocationProvider.currentNTIID);
            return;
        }
        this.bookmarkModel = r;
        this.favorite.addCls('on');

        if (favStore) {
            found = favStore.findRecord('NTIID', this.bookmarkModel.get('NTIID'), 0, false, false, true);
            //undo fancy URLbuilding hack where favorites are set at highlights to fins an accepts that works.
            this.bookmarkModel.mimeType = 'application/vnd.nextthought.bookmark';
            if (!found){favStore.add(this.bookmarkModel);}
        }
    },


	afterRender: function(){
		var me = this;
		this.callParent(arguments);

		this.mon( this.favorite, 'click', this.onFavoriteClick, this);
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
        this.fireEvent('save-new-bookmark');
    },


	clearBookmark: function(){
        this.favorite.removeCls('on');
        delete this.bookmarkModel;
	}
});
