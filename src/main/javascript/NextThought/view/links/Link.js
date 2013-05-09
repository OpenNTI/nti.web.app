Ext.define('NextThought.view.links.Link',{
	extend: 'Ext.Component',
	alias: 'widget.external-link',

	mixins: {
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions'
		//profileLinks: 'NextThought.mixins.ProfileLinks' // For future, maybe?
	},

	ui: 'object-link',
	cls: 'object-link',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'thumbnail', style:{ backgroundImage: 'url({thumbnail});'} },
		{ cls: 'controls', cn: [
			{ cls: 'favorite' },
			{ cls: 'like' }
		]},
		{ cls: 'meta', cn: [
			{ cls:'title', html:'{title}' },
			{ cls:'byline', html:'By {author}' },
			{ cls:'description', html:'{preview}' }
		]}
	]),


	renderSelectors: {
		liked: '.controls .like',
		favorites: '.controls .favorite'
	},


	constructor: function(){
		this.callParent(arguments);
		this.mixins.likeAndFavoriteActions.constructor.call(this);
		return this;
	},


	getRecord: function(){
		//TODO: we need a record to like/favorite.
	},


	beforeRender: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData||{},this.data);
	}
});
