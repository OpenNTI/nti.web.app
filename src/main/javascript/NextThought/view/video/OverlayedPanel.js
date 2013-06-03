/*jslint */
/*global DomUtils */
Ext.define('NextThought.view.video.OverlayedPanel',{
	extend: 'NextThought.view.content.overlay.Panel',
	alias: 'widget.overlay-video',

	requires:[
		'NextThought.util.Dom',
		'NextThought.view.video.Video'
	],

	ui: 'content-video',
	cls: 'content-video-container',

	statics: {
		getData: function(dom, reader){
			var el = Ext.get(dom),
				data = DomUtils.parseDomObject(dom),
				description = el.down('span.description');

			Ext.applyIf(data,{
				description: (description && description.getHTML()) || ''
			});
			return data;
		}
	},

	constructor: function(config){
		if(!config || !config.contentElement){
			throw 'you must supply a contentElement';
		}

		var dom = config.contentElement,
			el = Ext.get(dom),
			reader = config.reader,
			data = DomUtils.parseDomObject(dom),
			description = el.down('span.description'),
			i,
			sources = el.query('object[type$=videosource]'),
			playlist = [],
			sourcesMap = {},
			sourceComparator;

		sourceComparator = function(a, b) {
			var c = 0, $a = a['attribute-data-priority'], $b = b['attribute-data-priority'];

			if($a !== $b){
				c = $a < $b? -1 : 1;
			}

			return c;
		};

		for (i=0; i<sources.length; i++){
			sources[i] = (DomUtils.parseDomObject(sources[i]));
			sourcesMap[sources[i].type] = sources[i];
		}
		Ext.Array.sort(sources, sourceComparator);

		playlist.push(
			{
				sources: sources,
				currentSource: 0,
				getSources: function(service){
					var i = [];
					Ext.each(this,function(o){
						if(!service || (o && service === o.service)){
							i.push(o.source);
						}
					});
				}
			}
		);

		Ext.applyIf(data,{
			basePath: reader && reader.basePath,
			description: (description && description.getHTML()) || ''
		});

		Ext.apply(config,{
			layout:'fit',
			items:[{
				xtype: 'content-video',
				data: data,
				playlist: playlist,
				contentElement: dom
			}]
		});

		this.callParent([config]);
	},


	findLine: function(){
		var doc = this.contentElement.ownerDocument,
			range = doc.createRange();

		range.selectNode(this.contentElement);
		return {range: range, rect: this.el.dom.getBoundingClientRect()};
	}
});
