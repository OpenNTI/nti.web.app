Ext.define('NextThought.app.context.types.Slide', {

	requires: [
		'NextThought.app.context.components.Default',
		'NextThought.app.context.components.cards.Slide'
	],

	statics: {
		type: 'slide',

		canHandle: function(obj) {
			return obj && (obj.Class === 'Slide' || obj instanceof NextThought.model.Slide);
		}
	},

	contextTpl: Ext.DomHelper.markup([
		{cls: 'image-wrap', cn: [
			{tag: 'img', src: '{image}'}
		]}
	]),

	constructor: function(config) {
		this.callParent(arguments);
		Ext.applyIf(this, config || {});
		this.MediaActions = NextThought.app.mediaviewer.Actions.create();
		this.PathActions = NextThought.app.navigation.path.Actions.create();
	},


	getBasePath: function(obj) {
		var slidedeckId = obj && obj.get('slidedeckid'),
			me = this;

		if (!slidedeckId) {
			return Promise.resolve();
		}

		return this.MediaActions.loadSlidedeck(slidedeckId)
			.then(this.MediaActions.getBasePath.bind(this.MediaActions));
	},


	parse: function(slide, kind) {
		var context, cmp, me = this, store, t;

		return this.getBasePath(slide)
				.then(function(basePath) {
					return Promise.resolve(basePath);
				})
				.fail(function() {
					console.log(arguments);
					return Promise.resolve();
				})
				.then(function(root) {
					var dom = new Ext.XTemplate(me.contextTpl).apply({image: (root || '') + slide.get('image')}),
						cmp;
					dom = Ext.DomHelper.createDom({cls: 'content-launcher', html: dom});

					if (kind === 'card' || kind === 'list') {
						cmp = Ext.widget('context-slide-card', {
							slide: slide,
							contextDom: dom,
							containerId: me.container,
							record: me.record,
							doNavigate: me.doNavigate,
							type: kind
						});
					}
					else {
						cmp = Ext.widget('context-default', {
							snippet: dom,
							fullContext: dom,
							containerId: me.container,
							record: me.record,
							doNavigate: me.doNavigate
						});
					}

					return Promise.resolve(cmp);
				});
	}
});