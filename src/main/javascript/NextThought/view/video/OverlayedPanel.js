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

//	childEls: ['body'],
//	getTargetEl: function(){return this.bodyEl; },
	componentLayout: 'natural',

	renderTpl: Ext.DomHelper.markup([
		{id:'{id}-body', cls:'body', cn:['{%this.renderContainer(out, values)%}']},
		{tag:'a', cls:'media-transcript', html:'Play with Transcript'}
	]),

	renderSelectors: {
		openMediaViewerEl:'.media-transcript'
	},

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

		this.data = data;
		this.playlist = playlist;

		this.callParent([config]);
	},


	openMediaViewer: function(){
		var v = this.playlist[0];
		console.log('should start media player for video: ', v.get('NTIID'));
		this.fireEvent('start-media-player', v, v.get('NTIID'), this.reader.basePath);
	},


	afterRender: function(){
		this.callParent(arguments);

		// FIXME: This is a debug hack in order to be able to launch the video viewer from the content I have.
		// IT NEEDS TO BE TAKEN OUT, ASAP.
		if(this.openMediaViewerEl){
			this.mon( this.openMediaViewerEl, {
				scope:this,
				'click':'openMediaViewer'
			});
		}
	},



	findLine: function(){
		var doc = this.contentElement.ownerDocument,
			range = doc.createRange();

		range.selectNode(this.contentElement);
		return {range: range, rect: this.el.dom.getBoundingClientRect()};
	}
});
