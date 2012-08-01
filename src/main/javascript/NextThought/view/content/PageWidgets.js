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
				cn: [{ cls: 'favorite' },{ cls: 'like' }]
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

		LocationProvider.on('navigateComplete',this.updateMeta, this);
	},


	afterRender: function(){
		var me = this;
		this.callParent(arguments);
		this.updateMeta(this.pageInfo);

		this.mon( this.like, 'click', function(){ if(me.pageInfo){me.pageInfo.like(me.like);}},this);
		this.mon( this.favorite, 'click', function(){ if(me.pageInfo){me.pageInfo.favorite(me.favorite);}},this);
	},


	updateMeta: function(pageInfo){
		var r = this.pageInfo = pageInfo;
		if(this.rendered && r){
			this.like.update(r.getFriendlyLikeCount());
			this.like[(r.isLiked()?'add':'remove')+'Cls']('on');
			this.favorite[(r.isFavorited()?'add':'remove')+'Cls']('on');
		}
	}
});
