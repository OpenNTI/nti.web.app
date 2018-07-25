const Ext = require('@nti/extjs');

const MediaviewerActions = require('legacy/app/mediaviewer/Actions');
const PathActions = require('legacy/app/navigation/path/Actions');
const Slide = require('legacy/model/Slide');
const Globals = require('legacy/util/Globals');

require('../components/Default');
require('../components/cards/Slide');


module.exports = exports = Ext.define('NextThought.app.context.types.Slide', {
	statics: {
		type: 'slide',

		canHandle: function (obj) {
			return obj && (obj.Class === 'Slide' || obj instanceof Slide);
		}
	},

	contextTpl: Ext.DomHelper.markup([
		{cls: 'image-wrap', cn: [
			{tag: 'img', src: '{image}'}
		]}
	]),

	constructor: function (config) {
		this.callParent(arguments);
		Ext.applyIf(this, config || {});
		this.MediaActions = MediaviewerActions.create();
		this.PathActions = PathActions.create();
	},

	getBasePath: function (obj) {
		var slidedeckId = obj && obj.get('slidedeckid');

		if (!slidedeckId) {
			return Promise.resolve();
		}

		return this.MediaActions.loadSlidedeck(slidedeckId)
			.then(this.MediaActions.getBasePath.bind(this.MediaActions));
	},

	parse: function (slide, kind) {
		var me = this;

		return this.getBasePath(slide)
			.then(function (basePath) {
				return Promise.resolve(basePath);
			})
			.catch(function () {
				console.log(arguments);
				return Promise.resolve();
			})
			.then(function (root) {
				const slideImage = slide.get('image');
				const image = Globals.ROOT_URL_PATTERN.test(slideImage) ? slideImage : (root || '') + slideImage;

				var dom = new Ext.XTemplate(me.contextTpl).apply({ image }),
					cmp, config;
				dom = Ext.DomHelper.createDom({cls: 'content-launcher', html: dom});

				if (kind === 'card' || kind === 'list') {
					config = {
						slide: slide,
						contextDom: dom,
						containerId: me.container,
						record: me.record || me.contextRecord,
						doNavigate: me.doNavigate,
						type: kind
					};

					if (kind === 'card') {
						cmp = Ext.apply(config, {xtype: 'context-slide-card'});
					}
					else {
						cmp = Ext.widget('context-slide-card', config);
					}


				}
				else {
					cmp = Ext.widget('context-default', {
						snippet: dom,
						fullContext: dom,
						containerId: me.container,
						record: me.record || me.contextRecord,
						doNavigate: me.doNavigate
					});
				}

				return Promise.resolve(cmp);
			});
	}
});
