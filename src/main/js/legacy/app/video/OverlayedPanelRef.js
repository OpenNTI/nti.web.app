const Ext = require('extjs');

const PlaylistItem = require('legacy/model/PlaylistItem');
const VideoPosters = require('legacy/model/resolvers/VideoPosters');

require('../contentviewer/overlay/Panel');
require('./Video');


module.exports = exports = Ext.define('NextThought.app.video.OverlayedPanelRef', {
	extend: 'NextThought.app.video.OverlayedPanel',
	alias: 'widget.overlay-video-ref',

	constructor: function (config) {
		this.callParent([config]);
	},

	createPlaylistItem: function (index) {
		const id = this.data['ntiid'];
		let item = PlaylistItem.fromDom(this.dom);
		item.set('sources', index[id].sources);
		item.set('NTIID', id);

		return item;
	},

	getVideo: function (bundle, content) {
		const id = this.data['ntiid'];

		return Service.getObject(id).then((video) => {
			return {
				[id]: video.data
			};
		}).catch(() => {
			return Promise.reject('Video no longer exists');
		});
	},

	fillVideo: function (index) {
		var me = this,
			id = me.data['ntiid'],
			source = index[id].sources[0],
			poster = source.poster,
			label = index[id].title;

		if (poster) {
			me.setBackground(poster, label);
		} else {
			VideoPosters.resolveForSource(source)
				.then(function (imgs) {
					me.setBackground(imgs.poster, label);
				});
		}
	},

	findLine () {
		var doc = this.contentElement.ownerDocument,
			range = doc.createRange();

		const p = this.contentElement.parentNode;

		if (p.tagName !== 'P' || p.children.length !== 1) {
			console.warn('INVALID VIDEO REF, WILL NOT BE ABLE TO ANCHOR NOTES');
			return null;

		}

		range.selectNode(p);

		return {range, rect: this.el.dom.getBoundingClientRect()};
	}
});
