Ext.define('NextThought.ux.ImageZoomView',{
	alias: 'widget.image-zoom-view',
	extend: 'Ext.Component',

	ui: 'zoom',
	cls: 'zoom',
	floating: true,
	modal: true,
	plain: true,
	width: 275,
	height: 200,

	renderTpl: Ext.DomHelper.markup([{ tag: 'img' },{ cls: 'bar', cn: [{tag: 'a', cls: 'unzoom close', href:'#unzoom'}] }]),

	renderSelectors: {
		closeEl: 'a.close',
		image: 'img'
	},

	initComponent: function(){
		this.callParent(arguments);
		//{url: nextSizeUrl, refEl: img, offsets: offsets}

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
		var n = Ext.query('.nav-helper').first();
		if(n){ Ext.fly(n).show(); }
		return this.callParent(arguments);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.el.mask('Loading...');
		this.mon(this.closeEl,'click', this.close, this);
        this.mon(this.el,'keypress', function(){console.log('keydown', arguments);}, this);

		var me = this,
			img = new Image(),
			El = Ext.dom.Element;

		img.onerror = function(){
			alert('Could not load image');
			me.destroy();
		};

		img.onload = function(){

			var padding = 50,
				vpH = (El.getViewportHeight()-padding),
				vpW = (El.getViewportWidth()-padding),
				h = img.height,
				w = img.width;

			console.log(w,h);
			if(h > vpH){
				w = (vpH/h) * w;
				h = vpH;
				console.log('sized h', w,h);
			}

			if(w > vpW){
				h = (vpW/w) * h;
				w = vpW;
				console.log('sized w', w,h);
			}

			me.setSize(w, h);
			me.center();
			me.image.dom.src = img.src;
			me.el.unmask();
		};
		img.src = this.url;


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
		zoomImage: function(el,basePath,offsets){
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
				nextSizeUrl = (basePath||(src.replace(new RegExp(RegExp.escape(currentSizeUrl)),''))),
				rect = img.getBoundingClientRect();//these are in the document space. We need to convert this to screen space.

			nextSizeUrl += img.getAttribute(nextSize);
			// TODO: optimzise for bandwidth and screen size and choose the best one based on current and client screen size
			// For now, i'm not going to grab the full.
			console.log('zoom', img.width+'x'+img.height, rect, offsets, currentSize, nextSize, nextSizeUrl);

			Ext.widget('image-zoom-view',{url: nextSizeUrl, refEl: img, offsets: offsets}).show();
		}
	}

}, function(){
	window.ImageZoomView = this;
});
