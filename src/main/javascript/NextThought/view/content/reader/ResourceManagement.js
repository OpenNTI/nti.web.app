Ext.define('NextThought.view.content.reader.ResourceManagement', function(){
	var manager;

	return {


		constructor: function(){
			var reader = this;
			manager = Ext.createByAlias('reader.resourceManager',reader);
		},


		getResourceManager: function(){
			return manager;
		}


	};
});


Ext.define('NextThought.view.content.reader.ResourceManager',{
	alias: 'reader.resourceManager',

	requires: [
		'NextThought.ux.ImageZoomView',
		'NextThought.ux.SlideDeck',
		'NextThought.view.links.OverlayedPanel',
		'NextThought.view.video.OverlayedPanel',
		'NextThought.view.image.OverlayedPanel'
	],

	YOU_TUBE_API_KEY: 'YT',
	YOU_TUBE_IFRAME_QUERY: 'iframe[src*="youtube.com"]',
	YOU_TUBE_BLOCKED_TPL: Ext.DomHelper.createTemplate({
		cls: 'youtube blocked video',
		html: 'YouTube appears to be blocked by your connection.'
	}),


	IMAGE_TEMPLATE: new Ext.XTemplate( Ext.DomHelper.markup([{
		cls: 'wrapper',
		cn:[{
			tag: 'a',
			href:'#zoom',
			'data-qtip':'Enlarge',
			cls: 'zoom disabled',
			html: ' ',
			'data-non-anchorable': true
		}]
	},{
		tag: 'span',
		cls: 'bar',
		'data-non-anchorable': true,
		'data-no-anchors-within': true,
		unselectable: true,
		cn: [{
			tag: 'a',
			href:'#slide',
			'data-qtip':'Open Slides',
			cls: 'bar-cell slide',
			html: ' '
		},{
			cls: 'bar-cell {[values.title || values.caption ? \'\' : \'no-details\']}',
			cn: [{
				tag: 'tpl',
				'if': 'title',
				cn:{
					tag: 'span',
					cls: 'image-title',
					html: '{title}'
				}
			},{
				tag: 'tpl',
				'if': 'caption',
				cn:{
					tag: 'span',
					cls: 'image-caption',
					html: '{caption}'
				}
			},{
				tag: 'a',
				href:'#mark',
				'data-qtip':'Comment on this',
				cls: 'mark',
				html: 'Comment'
			}]
		}]
	}])),


	constructor: function(reader){
		this.reader = reader;
		reader.on('set-content','manage',this,{delay:1});
	},


	manage: function(reader){
		this.activateObjectLinks.apply(this,arguments);
		this.activateVideoRoll.apply(this,arguments);
		this.activateImageRoll.apply(this,arguments);
		this.activateAnnotatableItems.apply(this,arguments);
		this.manageYouTubeVideos();
	},


	manageYouTubeVideos: function(){
		var d,items, tpl = this.YOU_TUBE_BLOCKED_TPL;

		if(window[this.YOU_TUBE_API_KEY] !== undefined){
			return;
		}

		d = this.reader.getDocumentElement();
		items = d.querySelectorAll(this.YOU_TUBE_IFRAME_QUERY);

		Ext.each(items,function(i){
			tpl.insertBefore(i);
			Ext.fly(i).remove();
		});
	},


	activateObjectLinks: function(reader, doc, NTIID, subContainers, assessmentItems){
		this.activateOverlayedPanel(reader,doc,'object[type$=external-link]','overlay-link');
	},


	activateVideoRoll: function(reader, doc, NTIID, subContainers, assessmentItems){
		this.activateOverlayedPanel(reader,doc,'object[type$=videoroll]','overlay-video-roll');
	},


	activateImageRoll: function(reader, doc, NTIID, subContainers, assessmentItems){
		this.activateOverlayedPanel(reader,doc,'object[type$=image-collection]','overlay-image-roll');
	},


	activateOverlayedPanel: function(reader,doc, query, widgetXType){
		var me = reader,
			els = doc.querySelectorAll(query);

		Ext.each(els,function(el){
			me.registerOverlayedPanel(el.getAttribute('data-ntiid'), Ext.widget(widgetXType,{
				reader: me,
				renderTo: me.componentOverlayEl,
				tabIndexTracker: reader.overlayedPanelTabIndexer,
				contentElement: el
			}));
		});
	},


	activateAnnotatableItems: function(reader, doc, NTIID, subContainers, assessmentItems){
		var els = doc.querySelectorAll('[itemprop~=nti-data-markupenabled],[itemprop~=nti-slide-video]'),
			tpl = this.IMAGE_TEMPLATE,
			activators = {
				'nti-data-resizeable': Ext.bind(this.activateZoomBox,this)
			};

		function get(el,attr){ return el? el.getAttribute(attr) : null; }

		function getStyle(el){
			var s = (get(el,'style')||'').replace(/\s+/ig,'').split(';'), r = {};
			Ext.each(s,function(v){v = (v||'').split(':');r[v[0].toLowerCase()] = v[1];});
			return r;
		}

		Ext.each(els,function(el){
			var p = (el.getAttribute('itemprop')||'').split(' '),
				target = Ext.fly(el).down('img,iframe',true),
				title = get(target,'data-title'),
				caption = get(target,'data-caption'),
				width,
				bar = tpl.append(el,{
					title: title,
					caption: caption
				},false);

			if(!title && !caption){
				Ext.fly(el).addCls('no-details');
			}
			Ext.fly(bar).unselectable();

			//move the targeted element into a wrapper
			if(Ext.fly(target).is('iframe') || !Ext.Array.contains(p,'nti-data-resizeable')){
				Ext.fly(el.querySelector('.wrapper a')).remove();
			}
			el.querySelector('.wrapper').appendChild(target);

			width = (parseInt(getStyle(target).width||get(target,'width'),10)||Ext.fly(target).getWidth())
				+ Ext.get(el).getBorderWidth('lr');

			Ext.get(el).setWidth(width);


			Ext.each(p,function(feature){
				(activators[feature]||Ext.emptyFn)(el,bar,reader.basePath);
			});
		});
	},


	activateZoomBox: function(containerEl, toolbarEl,basePath){
		try{
			Ext.fly(containerEl.querySelector('a.zoom')).removeCls('disabled');
			var img = containerEl.querySelector('img[id]:not([id^=ext])'),
				current = img.getAttribute('data-nti-image-size');

			//TODO: precache the most likely-to-be-used image, for now, we're just grabbing them all.
			Ext.each(['full','half','quarter'],function(size){
				if(size === current){return;}
				new Image().src = basePath+img.getAttribute('data-nti-image-'+size);
			});
		}
		catch(e){
			console.warn('Could not precache larger image',containerEl);
		}
	}
});
