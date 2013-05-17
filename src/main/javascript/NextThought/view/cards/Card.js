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
		var d = (config && config.data) || {};
		if(!this.shouldOpenInApp(d.href, d.basePath)){
			this.renderTpl = Ext.DomHelper.markup({tag:'a', target:'_blank', href:d.href, html:this.renderTpl.html || this.renderTpl});
			this.bypassEvent = true;
		}

		this.callParent(arguments);
//		this.mixins.likeAndFavoriteActions.constructor.call(this);
		return this;
	},


	shouldOpenInApp: function(url, basePath){
		var isNTIID = ParseUtils.parseNtiid(url) !== null,
			//isLocal = (new RegExp('^'+RegExp.escape(basePath),'i')).test(url),
			pdf = (/\.pdf$/i).test((url||'').split('?')[0]);

		return isNTIID || pdf;
	},


//	getRecord: function(){
		//TODO: we need a record to like/favorite.
//	},


	beforeRender: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData||{},this.data);
		this.target = this.data.href;
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.el,'click','onCardClicked',this);

		if(LocationProvider.currentPageInfo.originalNTIIDRequested===this.data.ntiid){
			Ext.defer(this.onCardClicked,1,this);
		}
	},


	onCardClicked: function(e){
		var status;
		//We cannot "stop" the event, or our anchor will not receive it, so bypassing simply prevents us from acting on it.
		if(this.bypassEvent){
			return undefined;
		}

		if(ParseUtils.parseNtiid(this.target) !== null){
			status = this.fireEvent('navigate-to-href',this,this.target);
		}
		else {
			status = this.fireEvent('show-target',this,this.data, !e);
		}

		return status;
	}
});
