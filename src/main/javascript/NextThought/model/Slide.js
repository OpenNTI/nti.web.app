/*jslint */
/*globals LocationProvider, NextThought, ParseUtils */
Ext.define('NextThought.model.Slide', {
	extend: 'NextThought.model.Base',

	requires: [
		'NextThought.model.PlaylistItem'
	],

	fields: [
		{ name: 'title', type: 'string' },
		{ name: 'image', type: 'string' },
		{ name: 'image-thumbnail', type: 'string' },
		{ name: 'media', type: 'auto' },
		{ name: 'video', type: 'string' },
		{ name: 'video-type', type: 'string' },
		{ name: 'video-id', type: 'string' },
		{ name: 'video-thumbnail', type: 'string' },
		{ name: 'video-start', type: 'number' },
		{ name: 'video-end', type: 'number' },
		{ name: 'ordinal', type: 'number' },
		{ name: 'dom-clone', type: 'auto'},
		{ name: 'slidedeck-id', type: 'string' }
	],


	getSibling: function(direction){
		var s = this.store;
		return s.getAt(s.indexOf(this) + direction);
	},


	statics:{
		fromDom: function(dom,containerId){

			function getParam(name){
				var el = DQ.select('param[name="'+name+'"]',dom)[0];
				return el ? el.getAttribute('value') : null;
			}

			function getImage(){
				var el = DQ.select('[itemprop] img',dom)[0], v = null;
				if(el){
					v = el.getAttribute('data-nti-image-thumbnail')
						|| el.getAttribute('data-nti-image-quarter');
				}
				return v;
			}

			var DQ = Ext.DomQuery,
				el = Ext.get(dom),
				frag = (dom.ownerDocument||document).createDocumentFragment(),
				root = LocationProvider.getContentRoot(containerId),
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
					'video-id': getParam('slidevideoid'),
					'video-thumbnail': getParam('slidevideothumbnail'),
					'video-start': getParam('slidevideostart'),
					'video-end': getParam('slidevideoend'),
					'ordinal': getParam('slidenumber'),
					'dom-clone': frag
				};

			nodes = el.select('object[type$=ntivideo]');
			if (nodes.first()){
				o.media = NextThought.model.PlaylistItem.fromDom(nodes.first());
				o.media.set('mediaId', o.ordinal);
				o.media.set('start', o['video-start'] || 0.0);
				o.media.set('end', o['video-end'] || -1.0);
			}
			else {
				o.media = new NextThought.model.PlaylistItem({
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
		}
	}
});
