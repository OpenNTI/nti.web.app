Ext.define('NextThought.view.cards.Card',{
	extend: 'Ext.Component',
	alias: 'widget.content-card',

	mixins: {
//		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions'
//		profileLinks: 'NextThought.mixins.ProfileLinks' // For future, maybe?
	},

	ui: 'content-card',
	cls: 'content-card',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'thumbnail', style:{ backgroundImage: 'url({thumbnail})'} },
//		{ cls: 'controls', cn: [
//			{ cls: 'favorite' },
//			{ cls: 'like' }
//		]},
		{ cls: 'meta', cn: [
			{ cls:'title', html:'{title}' },
			{ cls:'byline', html:'By {creator}' },
			{ cls:'description', html:'{description}' }
		]}
	]),


	renderSelectors: {
		liked: '.controls .like',
		favorites: '.controls .favorite'
	},


	constructor: function(config){
		if(this.shouldOpenInNewWindow(config.data.href)){
			this.renderTpl = Ext.DomHelper.markup({tag:'a', target:'_blank', href:config.data.href, html:this.renderTpl});
		}

		this.callParent(arguments);
//		this.mixins.likeAndFavoriteActions.constructor.call(this);
		return this;
	},


	shouldOpenInNewWindow: function(url){
		console.debug(url);
		return true;
	},


//	getRecord: function(){
		//TODO: we need a record to like/favorite.
//	},


	beforeRender: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData||{},this.data);
	}
});
