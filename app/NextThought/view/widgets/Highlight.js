Ext.define('NextThought.view.widgets.Highlight', {
	extend: 'NextThought.view.widgets.Annotation',
	
	_sel: null,
	_canvas: null,
	_rgba: null,
	_color: null,

	constructor: function(selection, record, container, component){
		var me = this, c;
		me.addEvents({
            colorchanged : true
        });
        me.callParent([record, container, component,'resources/images/charms/highlight-white.png']);
		me._sel = selection;

		c = me._createCanvasContainer('canvas-highlight-container');
		me._canvas = me.createElement('canvas',c.dom,'highlight-object unselectable','position: absolute; pointer-events: none;'+(me._isVisible?'':'visibility:hidden;'));
		me._updateColor();

        me.render = Ext.Function.createBuffered(me.render,100,me,[true]);
		return me;
	},
	
	_createCanvasContainer: function(id){
		var e = Ext.get(id),
			n = e ? e.dom : this.createElement('div',this._cnt,'document-highlights unselectable'),
			p = n.parentNode;
		n.setAttribute('id',id);
		p.insertBefore(n,p.firstChild);
		return Ext.get(n);
	},
	
	visibilityChanged: function(show){
		this.callParent(arguments);
		var c = Ext.get(this._canvas);
		show? c.show() : c.hide();
	},
	
	_buildMenu: function(){
		var items = [];
		
		if(this._isMine) {
			items.push({
				text : 'Remove Highlight',
				handler: Ext.bind(this.remove, this)
			},{
				text : 'Change Color',
				menu: [Ext.create('Ext.ColorPalette', {
                listeners: { scope: this, select: this._colorSelected }})]
			});
		}
		
		items.push({
			text : 'Add a Note',
			handler: Ext.bind(this._addNote, this)
		});
		
		return this.callParent([items]);
	},
	
	_menuItemHook: function(o,item, menu){
		item.on('afterrender',Ext.bind(this.updateMenuIcon, item, [o._color]));
		o.on('colorchanged', this.updateMenuIcon, item);
	},
	
	_updateColor: function() {
		this._color = this._record.get('color');
		if ('yellow' == this._color) {
			this._color = 'FFFF00';
		}
		this._rgba = this._hexToRGBA(this._color);

		Ext.get(this._img).setStyle('background', '#' + this._color);
		this.render();		
	},
	
	_colorSelected: function(colorPicker, color) {
		this._record.set('color', color);
		this._updateColor();
		this._record.save();	
		this.fireEvent('colorchanged', color);	
	},
	
	
	_addNote: function(){
		this._cmp.addNote(this._sel);
	},

	updateMenuIcon: function(color) {
		var img = this.el.select('img.x-menu-item-icon').first()
		if(img){
			img.setStyle('background', '#'+color);
		}
	},
	
	cleanup: function(){
		this.callParent(arguments);
		Ext.get(this._canvas).remove();
		delete this._sel;
	},
	
	
	onResize : function(e){

		this.render();
	},
	
	_hexToRGBA: function(hex) {
		if ('yellow' == hex) {
			hex = 'FFFF00';
		}
		
		var red = hex.substring(0, 2);
		var green = hex.substring(2, 4);
		var blue = hex.substring(4);
		
		return 'rgba(' + parseInt(red, 16) + ',' + parseInt(green, 16) + ',' + parseInt(blue, 16) +',.3)';
	},
	
	render: function(){
		if(!this._sel){
			this.cleanup();
			return;
		}
		
		var r = this._sel.getBoundingClientRect(),
			s = this._sel.getClientRects(),
			c = this._canvas,
			p = this._parent ? this._parent : (this._parent = Ext.get(this._div.parentNode)),
			l = s.length;
		if(!r){
            return;
		}	
		Ext.get(c).moveTo(r.left, r.top);
		c.width = r.width; c.height = r.height;

		Ext.get(this._img).moveTo(p.getLeft(), r.top);
			
		var	ctx = c.getContext("2d"),			
			color = this._rgba;
	
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