const Ext = require('extjs');

const ContentUtils = require('../util/Content');
const ParseUtils = require('../util/Parsing');

const PlaylistItem = require('./PlaylistItem');
require('./Base');


module.exports = exports = Ext.define('NextThought.model.Slide', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'id', type: 'string', mapping: 'ntiid'},
		{ name: 'title', type: 'string' },
		{ name: 'image', type: 'string', mapping: 'slideimage'},
		{ name: 'image-thumbnail', type: 'string' },
		{ name: 'media', type: 'auto' },
		{ name: 'video', type: 'string' },
		{ name: 'video-type', type: 'string' },
		{ name: 'video-id', type: 'string', mapping: 'slidevideoid'},
		{ name: 'video-thumbnail', type: 'string' },
		{ name: 'video-start', type: 'number', mapping: 'slidevideostart'},
		{ name: 'video-end', type: 'number', mapping: 'slidevideoend'},
		{ name: 'ordinal', type: 'number', mapping: 'slidenumber'},
		{ name: 'dom-clone', type: 'auto'},
		{ name: 'slidedeckid', type: 'string'}
	],

	getSibling: function (direction) {
		var s = this.store;
		return s.getAt(s.indexOf(this) + direction);
	},

	statics: {
		getParamFromDom: function (dom, name) {
			var el = Ext.DomQuery.select('param[name="' + name + '"]', dom)[0];
			return el ? el.getAttribute('value') : null;
		},

		fromDom: function (dom, containerId, videoIndex) {
			var DQ = Ext.DomQuery, vid,
				el = Ext.get(dom.parentNode || dom),
				frag = (dom.ownerDocument || document).createDocumentFragment(),
				root = ContentUtils.getRoot(containerId),
				query = 'object[type$=video][data-ntiid="{0}"]',
				query2 = 'object[type$=video][data-ntiid]',
				nodes,
				o = {
					'Class': 'Slide',
					'ContainerId': containerId,
					'NTIID': dom.getAttribute('data-ntiid'),
					'slidedeck-id': getParam('slidedeckid') || 'default',
					'title': getParam('slidetitle'),
					'image': root + getParam('slideimage'),
					'image-thumbnail': root + getImage(),
					'video': getParam('slidevideo'),
					'video-type': getParam('slidevideotype'),
					'video-id': (vid = getParam('slidevideoid')),
					'video-thumbnail': getParam('slidevideothumbnail'),
					'video-start': getParam('slidevideostart'),
					'video-end': getParam('slidevideoend'),
					'ordinal': getParam('slidenumber'),
					'dom-clone': frag
				};

			query = Ext.String.format(query, ParseUtils.escapeId(vid));
			nodes = el.select(query);

			if (!nodes.first()) {
				nodes = Ext.fly(dom).select(query2);
			}

			if (nodes.first()) {
				o.media = PlaylistItem.fromDom(nodes.first(), videoIndex);
				o.media.set('mediaId', o.ordinal);
				o.media.set('start', o['video-start'] || 0.0);
				o.media.set('end', o['video-end'] || -1.0);
			}
			else {
				o.media = new PlaylistItem({
					mediaId: o.ordinal,
					sources: [
						{
							service: o['video-type'] || null,
							source: o.video || null
						}
					],
					start: o['video-start'] || 0,
					end: o['video-end'] || -1
				});
			}

			frag.appendChild(dom.cloneNode(true));

			return ParseUtils.parseItems(o)[0];


			function getParam (name) {
				var elm = DQ.select('param[name="' + name + '"]', dom)[0];
				return elm ? elm.getAttribute('value') : null;
			}

			function getImage () {
				var elm = DQ.select('[itemprop] img', dom)[0], v = null;
				if (elm) {
					v = elm.getAttribute('data-nti-image-thumbnail') ||
						elm.getAttribute('data-nti-image-quarter');
				}
				return v;
			}
		}
	}
});
