export default Ext.define('NextThought.common.components.cards.Card', {
	extend: 'Ext.Component',
	alias: 'widget.content-card',

	mixins: {
			'EllipsisText': 'NextThought.mixins.EllipsisText'
    //		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions'
    //		profileLinks: 'NextThought.mixins.ProfileLinks' // For future, maybe?
	},

	ui: 'content-card',
	cls: 'content-card',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'thumbnail', style: { backgroundImage: 'url({thumbnail})'} },
    //		{ cls: 'controls', cn: [
    //			{ cls: 'favorite' },
    //			{ cls: 'like' }
    //		]},
		{ cls: 'meta', cn: [
			{ cls: 'title', html: '{title}' },
			{ cls: 'byline', html: '{{{NextThought.view.cards.Card.by}}}' },
			{ cls: 'description', html: '{description}' }
		]}
	]),


	renderSelectors: {
		meta: '.meta',
		titleEl: '.meta .title',
		liked: '.controls .like',
		favorites: '.controls .favorite'
	},


	constructor: function(config) {
		var d = (config && config.data) || {};
		if (!this.shouldOpenInApp(d.ntiid, d.href, d.basePath, d.targetMimeType)) {
			this.renderTpl = Ext.DomHelper.markup({tag: 'a', target: '_blank', href: d.href, html: this.renderTpl.html || this.renderTpl});
			this.bypassEvent = true;
		}

		this.callParent(arguments);
    //		this.mixins.likeAndFavoriteActions.constructor.call(this);
	},


	shouldOpenInApp: function(ntiid, url, basePath, targetMimeType) {
		return Globals.shouldOpenInApp(ntiid, url, basePath, targetMimeType);
	},


  //	getRecord: function(){
		//TODO: we need a record to like/favorite.
  //	},


	beforeRender: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {},this.data);
		this.target = this.data.href;
	},


	afterRender: function() {
		this.callParent(arguments);
		this.mon(this.el, 'click', 'onCardClicked', this);

		if (Ext.isEmpty((this.data || {}).creator)) {
			this.el.down('.byline').remove();
		}

		try {
			var p = this.reader && this.reader.getLocation().pageInfo;
			if (this.reader && (p && p.originalNTIIDRequested === this.data.ntiid)) {
				Ext.defer(this.onCardClicked, 1, this);
			}
		}
		catch (er) {
			console.error(er.message);
		}


		if (this.titleEl) {
			this.truncateText(this.titleEl.dom, null, true);
		}
	},


	navigateToTarget: function(e) {
		var status,
			container = this.up('content-view-container'),
			bundle = container && container.currentBundle;

		if (ParseUtils.isNTIID(this.target)) {
			status = NextThought.app.navigation.Actions.navigateToHref(this.target);
		}
		else {
			status = NextThought.app.navigation.Actions.navigateToCardTarget(this.data, !e, function() {}, bundle);
		}
		return status;
	},


	onCardClicked: function(e) {
		//We cannot "stop" the event, or our anchor will not receive it, so bypassing simply prevents us from acting on it.
		if (this.bypassEvent) {
			return undefined;
		}
		return this.navigateToTarget(e);
	}
});
