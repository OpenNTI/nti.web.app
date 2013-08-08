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
		meta: '.meta',
		liked: '.controls .like',
		favorites: '.controls .favorite'
	},


	constructor: function(config){
		var d = (config && config.data) || {};
		if(!this.shouldOpenInApp(d.ntiid, d.href, d.basePath)){
			this.renderTpl = Ext.DomHelper.markup({tag:'a', target:'_blank', href:d.href, html:this.renderTpl.html || this.renderTpl});
			this.bypassEvent = true;
		}

		this.callParent(arguments);
//		this.mixins.likeAndFavoriteActions.constructor.call(this);
	},


	shouldOpenInApp: function(ntiid, url, basePath){
		var isTargetAnNTIID = ParseUtils.isNTIID(url),
			//isLocal = (new RegExp('^'+RegExp.escape(basePath),'i')).test(url),
			pdf = (/\.pdf$/i).test((url||'').split('?')[0]);

		//if the target is an NTIID, must open in the app. OR
		//if we have an NTIID AND the target is a PDF open in the app.
		// otherwise it cannot open in the app.
		return isTargetAnNTIID || (ntiid && pdf);
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

		try{
			if(this.reader && this.reader.getLocation().pageInfo.originalNTIIDRequested===this.data.ntiid){
				Ext.defer(this.onCardClicked,1,this);
			}
		}
		catch(er){
			console.error(er.message);
		}
	},


	onCardClicked: function(e){
		var status;
		//We cannot "stop" the event, or our anchor will not receive it, so bypassing simply prevents us from acting on it.
		if(this.bypassEvent){
			return undefined;
		}

		if(ParseUtils.isNTIID(this.target)){
			status = this.fireEvent('navigate-to-href',this,this.target);
		}
		else {
			status = this.fireEvent('show-target',this,this.data, !e, Ext.emptyFn/*needs a callback, we just don't care*/);
		}

		return status;
	}
});
