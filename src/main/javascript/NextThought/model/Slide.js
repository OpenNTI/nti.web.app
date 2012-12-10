Ext.define('NextThought.model.Slide', {
	extend: 'NextThought.model.Base',

	requires: [
	],

	fields: [
		{ name: 'title', type: 'string' },
		{ name: 'image', type: 'string' },
		{ name: 'video', type: 'string' },
		{ name: 'video-type', type: 'string' },
		{ name: 'video-id', type: 'string' },
		{ name: 'video-thumbnail', type: 'string' },
		{ name: 'video-start', type: 'string' },
		{ name: 'video-end', type: 'string' },
		{ name: 'ordinal', type: 'number' }
	],


	statics:{
		fromDom: function(dom,containerId){

			function getParam(name){
				var DQ = Ext.DomQuery,
					el = DQ.select('param[name="'+name+'"]',dom)[0];
				return el ? el.getAttribute('value') : null;
			}

			var o = {
				'Class': 'Slide',
				'ContainerId': containerId,
				'NTIID': dom.getAttribute('data-ntiid'),
				'title': getParam('slidetitle'),
				'image': getParam('slideimage'),
				'video': getParam('slidevideo'),
				'video-type': getParam('slidevideotype'),
				'video-id': getParam('slidevideoid'),
				'video-thumbnail': getParam('slidevideothumbnail'),
				'video-start': getParam('slidevideostart'),
				'video-End': getParam('slidevideoend'),
				'ordinal': getParam('slidenumber')
			};

			return ParseUtils.parseItems(o)[0];
		}
	}
});
