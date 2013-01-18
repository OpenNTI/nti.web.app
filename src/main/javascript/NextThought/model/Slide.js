Ext.define('NextThought.model.Slide', {
	extend: 'NextThought.model.Base',

	requires: [
	],

	fields: [
		{ name: 'title', type: 'string' },
		{ name: 'image', type: 'string' },
		{ name: 'image-thumbnail', type: 'string' },
		{ name: 'video', type: 'string' },
		{ name: 'video-type', type: 'string' },
		{ name: 'video-id', type: 'string' },
		{ name: 'video-thumbnail', type: 'string' },
		{ name: 'video-start', type: 'number' },
		{ name: 'video-end', type: 'number' },
		{ name: 'ordinal', type: 'number' },
		{ name: 'dom-clone', type: 'auto'}
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
				frag = (dom.ownerDocument||document).createDocumentFragment(),
				root = LocationProvider.getContentRoot(containerId),
				o = {
				'Class': 'Slide',
				'ContainerId': containerId,
				'NTIID': dom.getAttribute('data-ntiid'),
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

			frag.appendChild(dom.cloneNode(true));

			return ParseUtils.parseItems(o)[0];
		}
	}
});
