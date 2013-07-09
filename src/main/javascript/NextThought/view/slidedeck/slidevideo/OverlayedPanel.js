/*jslint */
/*global DomUtils */
Ext.define('NextThought.view.slidedeck.slidevideo.OverlayedPanel',{
	extend: 'NextThought.view.content.overlay.Panel',
	alias: 'widget.overlay-slidevideo',

	requires:[
		'NextThought.util.Dom',
		'NextThought.view.slidedeck.slidevideo.SlideVideo'
	],

	ui: 'content-slidevideo',
	cls: 'content-slidevideo-container',

	statics: {
		getData: function(dom, reader){
			var el = Ext.get(dom),
				data = DomUtils.parseDomObject(dom),
				description = el.down('span.description'),
				thumbnail = el.down('img');

			Ext.applyIf(data,{
				description: (description && description.getHTML()) || '',
				thumbnail: (thumbnail && thumbnail.getAttribute('src')) || '',
				transcript: this.getTranscriptData(el, reader)
			});
			return data;
		},

		getTranscriptData: function(el, reader){
			var transcript = {}, me = this;
			if(el.is('object object[type*=ntislidevideo][itemprop$=card]')){
				//Check if we have any transcript with the video
				Ext.each(el.query('object[type*=mediatranscript]'), function(t){
					var src =  Ext.fly(t).down('param[name=src]').getAttribute('value'),
						type = Ext.fly(t).down('param[name=type]').getAttribute('value'),
						altSource = Ext.fly(t).down('param[name=srcjsonp]').getAttribute('value');

					console.log('found transcript: ', t);
					transcript = {url:src, type:type, jsonUrl:altSource, basePath: reader.basePath, contentElement: t}; // me.getVideoTranscriptElement(t, el)};
				});
			}

			return transcript;
		},

		getVideoTranscriptElement: function(transcriptEl, domEl){
			// NOTE: we remove the transcript el from being underneath other objects tags
			//       to being a first child, so we can have it referenced by an overlay.
			Ext.fly(transcriptEl).remove();
			var p =  Ext.get(transcriptEl).insertAfter(domEl);
			if(p){
				p.setVisibilityMode(Ext.dom.Element.DISPLAY);
				p.hide();
			}
			return p;
		}
	},

	constructor: function(config){
		if(!config || !config.contentElement){
			throw 'you must supply a contentElement';
		}

		Ext.apply(config,{
			layout:'fit',
			items:[{
				xtype: 'content-slidevideo',
				data: this.self.getData(config.contentElement,config.reader),
				contentElement: config.contentElement,
				reader: config.reader
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

