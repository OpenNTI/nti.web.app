Ext.define('NextThought.view.widgets.Highlight', {
	extend: 'NextThought.view.widgets.Widget',
	
	_sel: null,
	_cmp: null,
	_canvas: null,
	_menu: null,

	constructor: function(selection, record, container, component){
		var d = Ext.query('.document-nibs',container);
		
		this._cmp = component;
		this._sel = selection;
		
		this._canvas = this.createElement('canvas',container,'highlight-object unselectable','position: absolute; pointer-events: none;');
		
		this._div = d.length>0? d[0] : this.createElement('div',container,'document-nibs unselectable');
		this._img = this.createImage(Ext.BLANK_IMAGE_URL,this._div,'action','width: 24px; height: 24px; background: yellow; position: absolute;');

		this._cmp.on('resize', this.onResize, this);
		Ext.EventManager.onWindowResize(this.onResize, this);
		
		Ext.get(this._img).on('click',function(){ this.cleanup(); record.destroy(); }, this);
		
		this.render();
		return this;
	},
	
	cleanup: function(){
		this._cmp.un('resize', this.onResize, this);
		Ext.EventManager.removeResizeListener(this.onResize, this);
		Ext.get(this._canvas).remove();
		Ext.get(this._img).remove();
		delete this._sel;
	},
	
	
	onResize : function(e){
		this.render();
	},
	
	
	render: function(){
		var r = this._sel.getBoundingClientRect(),
			s = this._sel.getClientRects(),
			c = this._canvas,
			p = Ext.get(this._div.parentNode),
			l = s.length;
			
		Ext.get(c).moveTo(r.left, r.top);
		c.width = r.width; c.height = r.height;

		Ext.get(this._img).moveTo(p.getLeft(), r.top);
			
		var	ctx = c.getContext("2d"),			
			color = "rgba(252,233,61,.3)";
	
		ctx.fillStyle = color;
		
		var avgH = 0;
		Ext.each(s,function(v){
			avgH += v.height;
		});
		
		avgH /= s.length;

		for(var i=0; i<l; i++){
			
			if(s[i].right == r.right && s[i].height>avgH){
				continue;
			}
			
			this.drawRect(ctx,this.adjustCoordinates(s[i],r));
			
		}
	},
	
	
	adjustCoordinates: function(rect,offsetToTrim){
		var r = rect, 
			o = offsetToTrim;
			
		r.top -= o.top; r.left -= o.left;
		return {
			top: r.top-o.top,
			left: r.left-o.left,
			width: r.width,
			height: r.height,
			right: r.left-o.left+r.width,
			bottom: r.top-o.top+r.height
		};
	},
	
	
	drawRect: function(ctx, rect){
		// debugger;
		ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
	}

});