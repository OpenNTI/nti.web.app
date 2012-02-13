/**
 * Creates a canvas element that is filled with a slightly transparent grey, then cuts out a transparent area to spotlight. An SVG blur will be added for those browsers that support it.
 *
 * Modeled after Ext.ux.Spotlight, but defers in that we only care about he rects that we want to highlight. So the api will be different, instead of asking for an id, Ext.Element, or DOM Element, we will ask for an object that we will call a spotlightableComponent, which just means it provides a method to retrieve an array of rects to spotlight.
 *
 * SpotlightableComponent {
 *     getRects() : Rect[]
 * }
 *
 * where:
 *
 * Rect {
 * 		left, top, right, bottom, width, height
 * }
 */
Ext.define('NextThought.ux.Spotlight',{
	requires: [
		'NextThought.util.RectUtils'
	],

//	svgNS: 'http:/'+'/www.w3.org/2000/svg',
//	xhtmlNS: 'http:/'+'/www.w3.org/1999/xhtml',

	constructor: function(){
		this.id = 'spotlight-'+Globals.guidGenerator();
		this.dom = Ext.getDoc().dom;
		if(!this.dom.createElementNS){
			console.warn('No browser support for createElementNS');
			dom.createElementNS = function(){return null;};
		}
		this.createElements();
		Ext.EventManager.onWindowResize(this.syncSize, this);
	},

	/**
	 * @param element
	 * @param attrs
	 * @param [updateCSS]
	 * @private
	 */
	set: function(element,attrs,updateCSS){
		if(!Ext.isArray(element)){ element = [element]; }
		Ext.Object.each(attrs,function(attr,value){
			Ext.each(element, function(el){
				if(el){
					el.setAttribute(attr,String(value));
					if(updateCSS !== false && (attr==='width'||attr==='height')){
						Ext.fly(el).setStyle(attr,value);
					}
				}
			});
		});
	},

	/** @private */
	createElements: function(){
	/*
		<svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml">
			<defs>
				<filter id="blur-guid" x="0%" y="0%" width="100%" height="100%">
					<feGaussianBlur in="SourceGraphic" stdDeviation="8" />
				</filter>
			</defs>
			<foreignObject width="100px" height="100px" style="filter:url(#gaussian_blur-guid)>
				<xhtml:canvas width="100px" height="100px" ></xhtml:canvas>
			</foreignObject>
		</svg>
	*/

		var curtain = Ext.getBody().createChild({id:this.id+'-curtain', cls:'spotlight'}).dom,
			canvas = this.dom.createElement('canvas');
//			canvas = this.dom.createElementNS(this.xhtmlNS,'canvas'),
//			svg = this.dom.createElementNS(this.svgNS, 'svg'),
//			fo = this.dom.createElementNS(this.svgNS, 'foreignObject'),
//			defs = this.dom.createElementNS(this.svgNS, 'defs'),
//			filter = this.dom.createElementNS(this.svgNS, 'filter'),
//			fx = this.dom.createElementNS(this.svgNS, 'feGaussianBlur'),
//			fxId = this.id+'-blur';

		this.set(curtain,{style:'display:none; position:absolute; top:0; left:0; z-index:8999; overflow:hidden;'});
//		this.set(svg, {id:this.id+'-svg',version:'1.1'});
//		this.set(filter, {id: fxId, x:"0%", y:"0%", width:"100%", height:"100%"},false);
//		this.set(fx, {'stdDeviation':'8'});
//		this.set(fo, {filter:'url(#'+fxId+')'});
		this.set(canvas, {width:0, height:0});

		if(!canvas){
			Ext.Error.raise('No canvas support');
		}

//		if(svg){
//			filter.appendChild(fx);
//			defs.appendChild(filter);
//			svg.appendChild(defs);
//			fo.appendChild(canvas);
//			svg.appendChild(fo);
//			curtain.appendChild(svg);
//		}
//		else {
//			svg = fo = defs = filter = fx = null;
			curtain.appendChild(canvas);
//		}

		this.curtain = curtain;
		this.canvas = canvas;
//		this.svg = svg;
//		this.elements = [curtain,canvas,svg,fo];
		this.elements = [curtain,canvas];
		this.syncSize();
	},

	destroy: function(){
		this.hide();
		Ext.EventManager.removeResizeListener(this.syncSize, this);

		Ext.destroy(Ext.get(this.canvas),Ext.get(this.svg),Ext.get(this.curtain));
		delete this.curtain;
		delete this.canvas;
		delete this.svg;
		delete this.elements
	},

	show: function(spotlightableComponent){
		Ext.fly(this.curtain).show();
		this.cmp = spotlightableComponent;
//		this.syncSize();
		this.render();
	},

	hide: function(){
		Ext.fly(this.curtain).hide();
		delete this.cmp;
	},

	render: function(){
		if(!this.canvas || !this.cmp){ return; }
		try {
			var i,
				c = this.canvas,
				w = c.width,
				h = c.height,
				ctx = c.getContext("2d"),
				rects = Array.prototype.slice.call(this.cmp.getRects()),
//				gco = ctx.globalCompositeOperation,
				rect, x,y;

			rects = RectUtils.merge(rects, h);

			//reset the context
			c.width = w; //faster than fill


			ctx.strokeStyle = "rgba(0,0,0,0.8)";
			ctx.fillStyle = "rgba(120,125,120,0.1)";

			for(i=rects.length-1; i>=0; i--){
				try {
					rect = rects[i];
					x = rect.x || rect.left;
					y = rect.y || rect.top;
					w = rect.width || (rect.right - x);
					h = rect.height || (rect.bottom - y);

					//draw the glow
					ctx.save();
					ctx.shadowOffsetX = 0;
					ctx.shadowOffsetY = 0;
					ctx.shadowBlur = 20;
					ctx.shadowColor = "rgba(0,0,0,1)";
					ctx.strokeStyle = "rgba(0,0,0,1)";
					ctx.fillStyle = "rgba(0,0,0,1)";

					ctx.beginPath();
					ctx.rect(x, y, w, h);
					ctx.fill();
					ctx.restore();

					//erase the middle
					ctx.save();
					ctx.strokeStyle = "rgba(0,0,0,1)";
					ctx.fillStyle = "rgba(0,0,0,1)";
					ctx.globalCompositeOperation = "destination-out";
					ctx.beginPath();
					ctx.rect(x, y, w, h);
					ctx.stroke();
					ctx.fill();
					ctx.restore();

					//draw the actual thing...
					ctx.beginPath();
					ctx.rect(x, y, w, h);
					ctx.stroke();
					ctx.fill();
				}
				catch(e){
					console.debug('rendering step... failed',e);
				}
			}
			//ctx.globalCompositeOperation = gco;
		}
		catch(err){
			console.warn(err.stack || err.message);
		}
	},


	syncSize: function(){
		var w = Ext.Element.getViewWidth(true),
			h = Ext.Element.getViewHeight(true);

		this.set(this.elements, {width:w,height:h});
		this.render();
	}
});
