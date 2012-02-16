/**
 * Creates a canvas element that spotlights a selected component.
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
 *     left, top, right, bottom, width, height
 * }
 */
Ext.define('NextThought.ux.Spotlight',{
	requires: [
		'NextThought.util.RectUtils'
	],

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
		var curtain = Ext.getBody().createChild({id:this.id+'-curtain', cls:'spotlight'}).dom,
			canvas = this.dom.createElement('canvas');

		this.set(curtain,{style:'display:none; position:absolute; top:0; left:0; z-index:8999; overflow:hidden;'});
		this.set(canvas, {width:0, height:0});

		if(!canvas){
			Ext.Error.raise('No canvas support');
		}

		curtain.appendChild(canvas);

		this.curtain = curtain;
		this.canvas = canvas;
		this.elements = [curtain,canvas];
		this.syncSize();
	},

	destroy: function(){
		this.hide();
		Ext.EventManager.removeResizeListener(this.syncSize, this);

		Ext.destroy(Ext.get(this.canvas),Ext.get(this.curtain));
		delete this.curtain;
		delete this.canvas;
		delete this.elements;
	},

	show: function(spotlightableComponent){
		Ext.fly(this.curtain).show();
		this.cmp = spotlightableComponent;
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
				h = this.cmp.getLineHeight(),
				ctx = c.getContext("2d"),
				rects = Array.prototype.slice.call(this.cmp.getRects()),
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
