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
	},


	afterRender: function(){
		this.callParent(arguments);
		this.el.mask('Loading...');
		this.mon(this.closeEl,'click', this.close, this);

		var me = this,
			img = new Image(),
			El = Ext.dom.Element;

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
	}

});
