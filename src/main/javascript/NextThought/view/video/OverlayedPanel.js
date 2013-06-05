/*jslint */
/*global DomUtils, NextThought */
Ext.define('NextThought.view.video.OverlayedPanel',{
	extend: 'NextThought.view.content.overlay.Panel',
	alias: 'widget.overlay-video',

	requires:[
		'NextThought.util.Dom',
		'NextThought.model.PlaylistItem',
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
			playlist = [];

		playlist.push(NextThought.model.PlaylistItem.fromDom(dom));

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
