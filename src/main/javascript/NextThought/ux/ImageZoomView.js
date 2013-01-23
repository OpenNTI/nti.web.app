Ext.define('NextThought.ux.ImageZoomView',{
	alias: 'widget.image-zoom-view',
	extend: 'Ext.Component',

	requires: [
		'NextThought.ux.SlideDeck'
	],

	ui: 'image-zoom-view',
	cls: 'zoom',
	floating: true,
	modal: true,
	plain: true,
	width: 275,
	height: 200,

	renderTpl: Ext.DomHelper.markup([{
		tag: 'a', href: '#unzoom', cls: 'close', 'data-qtip':'Close'
	},{
		cls: 'wrapper',
		cn:[{
			tag: 'img'
		},{
			tag: 'a',
			href:'#unzoom',
			cls: 'unzoom',
			html: ' '
		}]
	},{
		tag: 'span',
		cls: 'bar',
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
	}]),

	renderSelectors: {
		closeEl: 'a.close',
		closeEl2: 'a.unzoom',
		image: 'img',
		barEl: '.bar',
		commentEl: 'a.mark',
		presentationEl: 'a.slide'
	},

	initComponent: function(){
		this.callParent(arguments);
		//{url: nextSizeUrl, refEl: img, offsets: offsets}

		function get(el,attr){ return el? el.getAttribute(attr) : null; }

		this.renderData = Ext.apply(this.renderData||{},{
			title: get(this.refEl,'data-title'),
			caption: get(this.refEl,'data-caption')
		});

		var n, keyMap = new Ext.util.KeyMap({
			target: document,
			binding: [{
				key: Ext.EventObject.ESC,
				fn: this.destroy,
				scope: this
			}]
		});
		this.on('destroy',function(){keyMap.destroy(false);});

		n = Ext.query('.nav-helper').first();
		if(n){
			Ext.fly(n).hide();
		}
	},


	destroy: function(){
		Ext.EventManager.removeResizeListener(this.viewportMonitor,this);
		var n = Ext.query('.nav-helper').first();
		if(n){ Ext.fly(n).show(); }
		return this.callParent(arguments);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.el.mask('Loading...');
		this.el.set({tabindex:1});
		this.mon(this.closeEl,'click', this.close, this);
		this.mon(this.closeEl2,'click', this.close, this);
		this.mon(this.presentationEl,'click',this.openPresentation,this);
		this.mon(this.commentEl,'click',this.commentOn,this);

		var me = this,
			img = me.imageCache = new Image(),
			isSlide = Boolean(
					Ext.fly(me.refEl).parent('object[type$=slide]',true)
				||  Ext.fly(me.refEl).parent('object[type$=slidevideo]',true)
			);

		if(isSlide){
			me.presentationEl.show();
		}

		me.barHeightCache = me.barEl.getHeight();
		me.barEl.hide();

		img.onerror = function(){
			alert('Could not load image');
			me.destroy();
		};

		img.onload = function(){
			me.syncSize();
			me.barEl.show();
			me.image.dom.src = img.src;
			me.el.unmask();
		};
		img.src = this.url;

		Ext.defer(this.el.focus,100,this.el);
		Ext.EventManager.onWindowResize(this.viewportMonitor,this,undefined);
	},

	viewportMonitor: function(){
		var b = this.barEl.getHeight();
		this.barHeightCache = b > this.barHeightCache ? b : this.barHeightCache;
		this.syncSize();
	},

	syncSize: Ext.Function.createBuffered( function(){
		var El = Ext.dom.Element,
			me = this,
			barH = me.barHeightCache,
			img = me.imageCache,
			vpH = (El.getViewportHeight()-200),
			vpW = (El.getViewportWidth()-200),
			h = img.height,
			w = img.width;

		console.log(w,h);
		if((h+barH) > vpH){
			w = (vpH/h) * w;
			h = vpH;
			console.log('sized h', w,h);
		}

		if(w > vpW){
			h = (vpW/w) * h;
			w = vpW;
			console.log('sized w', w,h);
		}

		me.setSize(w, h+barH);
		me.center();

	}, 80),


	openPresentation: function(e){
		this.close();
		SlideDeck.open(this.refEl, LocationProvider.currentNTIID);
		e.stopEvent();
		return false;
	},


	commentOn: function(e){
		this.close();
		(this.ownerCmp || ReaderPanel.get()).fireEvent('markupenabled-action',this.refEl,'mark');
		e.stopEvent();
		return false;
	},


	close: function(e){
		this.destroy();
		if(e && e.stopEvent){
			e.stopEvent();
			return false;
		}
		return true;
	},


	statics: {
		zoomImage: function(el,offsets,ownerCmp){
			var img = Ext.fly(el)
					.up('[itemprop~=nti-data-markupenabled]')
					.down('img[id]').dom,
				sizes = [
					'data-nti-image-quarter',
					'data-nti-image-half',
					'data-nti-image-full'
				],
				sizeMap = {
					'quarter':0,
					'half':1,
					'full':2
				},
				src = img.getAttribute('src'),
				currentSizeName = img.getAttribute('data-nti-image-size'),
				currentSize = sizes[sizeMap[currentSizeName]],
				currentSizeUrl = img.getAttribute(currentSize),
				nextSize = sizes[Math.min(sizeMap[currentSizeName]+1,sizes.length-1)],
				nextSizeUrl = src.replace(new RegExp(RegExp.escape(currentSizeUrl)),''),
				rect = img.getBoundingClientRect();//these are in the document space. We need to convert this to screen space.

			nextSizeUrl += img.getAttribute(nextSize);
			// TODO: optimzise for bandwidth and screen size and choose the best one based on current and client screen size
			// For now, i'm not going to grab the full.
			console.log('zoom', img.width+'x'+img.height, rect, offsets, currentSize, nextSize, nextSizeUrl);

			Ext.widget('image-zoom-view',{url: nextSizeUrl, refEl: img, offsets: offsets, ownerCmp: ownerCmp}).show();
		}
	}

}, function(){
	window.ImageZoomView = this;
});
