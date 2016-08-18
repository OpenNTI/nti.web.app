const Ext = require('extjs');
const Globals = require('legacy/util/Globals');
const ParseUtils = require('legacy/util/Parsing');
const {AssetIcon} = require('nti-web-commons');
const RelatedWork = require('legacy/model/RelatedWork');
require('legacy/mixins/EllipsisText');


module.exports = exports = Ext.define('NextThought.common.components.cards.Card', {
	extend: 'Ext.Component',
	alias: 'widget.content-card',

	// mixins: {
	// 	EllipsisText: 'NextThought.mixins.EllipsisText'
	// 	// likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions'
	// 	// profileLinks: 'NextThought.mixins.ProfileLinks' // For future, maybe?
	// },

	ui: 'content-card',
	cls: 'content-card',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'thumbnail'},
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
		favorites: '.controls .favorite',
		thumbnailEl: '.thumbnail'
	},


	constructor: function (config) {
		var d = (config && config.data) || {};
		if (!this.shouldOpenInApp(d.ntiid, d.href, d.basePath, d.targetMimeType)) {
			this.renderTpl = Ext.DomHelper.markup({tag: 'a', target: '_blank', href: d.href, html: this.renderTpl.html || this.renderTpl});
			this.bypassEvent = true;
		}

		this.callParent(arguments);
	//		this.mixins.likeAndFavoriteActions.constructor.call(this);
	},


	shouldOpenInApp: function (ntiid, url, basePath, targetMimeType) {
		return Globals.shouldOpenInApp(ntiid, url, basePath, targetMimeType);
	},


  //	getRecord: function(){
		//TODO: we need a record to like/favorite.
  //	},


	beforeRender: function () {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {},this.data);
		this.target = this.data.href;
	},


	afterRender: function () {
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

		const type = this.data && this.data.targetMimeType;
		let icon = this.data && (this.data.thumbnail || this.data.icon);
		icon = icon && icon.indexOf(RelatedWork.FILE_FALLBACK_BLANK_IMAGE) > -1 ? null : icon;
		Ext.widget({
			xtype: 'react',
			src: icon,
			component: AssetIcon,
			mimeType: type,
			svg: icon ? false : true,
			renderTo: this.thumbnailEl
		});
	},


	navigateToTarget: function (e) {
		var status,
			container = this.up('content-view-container'),
			bundle = container && container.currentBundle;

		if (ParseUtils.isNTIID(this.target)) {
			status = NextThought.app.navigation.Actions.navigateToHref(this.target);
		}
		else {
			status = NextThought.app.navigation.Actions.navigateToCardTarget(this.data, !e, function () {}, bundle);
		}
		return status;
	},


	onCardClicked: function (e) {
		//We cannot "stop" the event, or our anchor will not receive it, so bypassing simply prevents us from acting on it.
		if (this.bypassEvent) {
			return undefined;
		}
		return this.navigateToTarget(e);
	}
});
