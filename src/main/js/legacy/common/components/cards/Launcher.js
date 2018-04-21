const Ext = require('@nti/extjs');

const DomUtils = require('legacy/util/Dom');
const VideoPosters = require('legacy/model/resolvers/VideoPosters');


module.exports = exports = Ext.define('NextThought.common.components.cards.Launcher', {
	extend: 'Ext.Component',
	alias: 'widget.content-launcher',

	statics: {
		getData: function (dom, reader, items, getThumb) {
			var data = DomUtils.parseDomObject(dom);

			Ext.apply(data, {
				ntiid: reader && reader.getLocation().NTIID,
				basePath: reader && reader.basePath,
				description: data.description,
				title: data.title,
				thumbnail: data && data.poster || getThumb(dom, data),
				items: items
			});
			return data;
		}
	},

	ui: 'content-launcher',
	cls: 'content-launcher',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'thumbnail', style: { backgroundImage: 'url({thumbnail})'} },
		{ cls: 'meta', cn: [
			{ cls: 'title', html: '{title}' },
			{ cls: 'description', html: '{description}' },
			{ cls: 'launcher-button', html: 'View' }
		]}
	]),

	renderSelectors: {
		thumbnailEl: '.thumbnail'
	},

	initComponent: function () {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {},this.data);

		this.on({
			el: {
				click: 'onLaunch'
			}
		});

		// For vimeo video, we will have to resolve their thumbnail.
		if(this.data && !this.data.thumbnail) {
			this.resolveVideoThumbnail();
		}
	},

	resolveVideoThumbnail: function () {
		var video = this.data && this.data.items && this.data.items[0],
			s = video && video.sources[0],
			id = s && s.source,
			type = s && s.service,
			Resolver = VideoPosters,
			me = this;

		if (id) {
			Resolver.resolvePoster(type, id)
				.then(function (thumb) {
					var thumbnail = thumb && thumb.thumbnail;
					me.onceRendered
						.then(function () {
							me.thumbnailEl.setStyle('backgroundImage', 'url(' + thumbnail + ')');
						});
				});
		}

	},

	onLaunch: function (e) {
		e.stopEvent();
		this.fireEvent('launch', this.data);
	}
});
