Ext.define('NextThought.view.widgets.draw.Whiteboard', {
	extend		: 'Ext.panel.Panel',
	alias		: 'widget.whiteboard',
	requires	: [
		'Ext.draw.Component',
		'Ext.menu.ColorPicker',
		'NextThought.view.widgets.draw.Resizer',
		'NextThought.view.widgets.draw.Rotater',
		'NextThought.view.widgets.draw.Polygon',
        'NextThought.view.widgets.draw.Line',
		'NextThought.view.widgets.draw.Ellipse',
		'NextThought.util.Color'
	],

	cls: 'whiteboard',
	layout:'fit',
	items: { xtype: 'draw', viewBox: false},

	shapeTypeMap: {
		ellipse: 'ellipse',
		line: 'line',
		path: 'base',
		polygon: 'polygon',
		text: 'base'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.selectedColor = {};

        this.addDocked(
            {
                dock: 'top',
                xtype: 'toolbar',
                cls: 'whiteboard-toolbar',
                items: [
                    {	iconCls: 'tool hand',		tooltip: 'hand', enableToggle: true, toggleGroup:'draw', pressed: true, allowDepress: false },
                    {	iconCls: 'tool rect',		tooltip: 'polygon',		shape: 'polygon', enableToggle: true, toggleGroup:'draw', allowDepress: false,
                        menu: {
                            items: {
                                xtype: 'buttongroup',
                                title: 'polygon options',
                                columns: 1,
                                items:[ {
                                    xtype: 'numberfield',
                                    fieldLabel: 'Sides',
                                    name: 'sides',
                                    value: 4,
                                    minValue: 3
                                } ]
                            } } },

                    {	iconCls: 'tool circle',		tooltip: 'circle',		shape: 'ellipse', enableToggle: true, toggleGroup:'draw', allowDepress: false},
                    {	iconCls: 'tool line',		tooltip: 'line',		shape: 'line', enableToggle: true, toggleGroup:'draw', allowDepress: false},
                    {	iconCls: 'tool path',		tooltip: 'path',		shape: 'path', enableToggle: true, toggleGroup:'draw', allowDepress: false},
                    {	iconCls: 'tool text',		tooltip: 'text box',	shape: 'text', disabled: true, enableToggle: true, toggleGroup:'draw', allowDepress: false},

                    '-',

                    {	iconCls: 'tool delete',		tooltip: 'delete',		action: 'delete', text: 'remove selection', whiteboardRef: this },
                    {	iconCls: 'tool clear',		tooltip: 'clear',		action: 'clear', text: 'clear', whiteboardRef: this },

                    '->',
                    {
                        xtype: 'numberfield',
                        fieldLabel: 'Stroke',
                        name: 'stroke-width',
                        width: 100,
                        whiteboardRef: this,
                        labelWidth: 40,
                        value: 1,
                        minValue: 0
                    },{
                        action: 'pick-stroke-color',
                        whiteboardRef: this,
                        iconCls: 'color', tooltip: 'Stroke Color',
                        menu: {xtype: 'colormenu', colorFor: 'stoke'}
                    },'-',{
                        text: 'Fill',
                        action: 'pick-fill-color',
                        whiteboardRef: this,
                        iconCls: 'color', tooltip: 'Fill Color',
                        menu: {xtype: 'colormenu', colorFor: 'fill'}
                    }
                ]
            }
        );
    },


	afterRender: function(){
		this.callParent(arguments);

		if(this.value){
			this.loadScene(this.value);
			delete this.value;
		}

		this.setColor('fill', '000000');
		this.setColor('stroke', '000000');
	},


	reset: function(){
		this.removeAll();
		if(this.initialConfig.value){
			this.loadScene(this.initialConfig.value);
		}
	},


	setColor: function(c, color){
		c = c.toLowerCase();
		this.selectedColor[c] = '#'+color;

		this.down(Ext.String.format('button[action=pick-{0}-color]',c))
				.getEl()
				.down('.x-btn-icon')
				.setStyle({background: this.selectedColor[c]});
	},



	toolDefaults: function(shape, x, y, strokeWidth, sides){
		strokeWidth = strokeWidth||2;
		sides = sides || 4;

		var cfg,
            d = {
			circle: {},
			polygon: { sides: sides },
			path: { type: 'path', fill: '#000000', translate: {} },
			line: { type: 'path', fill: '#000000', translate: {}, getShape:function(){return 'line';}},
			text: {
				type: 'text',
				text: 'Place holder text',
				font: '18px Arial'
			}
		};

		cfg = {
			translate: {x:x,y:y},
			'stroke-width': strokeWidth,
			stroke: this.selectedColor.stroke,
			fill: this.selectedColor.fill
		};

		return Ext.apply(cfg,d[shape]);
	},


	addShape: function(shape, x,y, strokeWidth, sides){
        var sp = Ext.widget('sprite-'+this.shapeTypeMap[shape],
				this.toolDefaults(shape, x, y, strokeWidth, sides));
        sp.whiteboardRef = this;
		this.getSurface().add(sp).show(true);

		this.relay(sp,'click');
		this.relay(sp,'dblClick');

		return sp;

	},


	relay: function(sprite, event){
		sprite.el.on(
				event,
				function(e){
					e.stopPropagation();
					e.preventDefault();
					this.fireEvent('sprite-'+event,sprite, this);
				},
				this);
	},


	removeSelection: function(){
		if(!this.selection)return;

		this.selection.sprite.destroy();

		this.selection.destroy();
		delete this.selection;
	},


	removeAll: function(){
		this.getSurface().removeAll(true);
	},


	select: function(sprite){
		var s = this.selection,
			prev = s ? s.sprite : null;

		if(s){
			s.destroy();
			delete this.selection;
		}

		if(!sprite) return;

		this.selection = Ext.widget((prev === sprite)? 'sprite-rotater':'sprite-resizer',this,sprite);
		this.selection.show(true);
	},


	getSurface: function(){
		if(!this._surf){
			this._surf = this.down('draw').surface;
		}
		return this._surf;
	},


	/* for testing... */
	loadFrom: function(url){
		Ext.Ajax.request({
			url: url,
			scope: this,
			callback: function(o,success,r){
				this.loadScene( Ext.decode(r.responseText) );
			}
		});
	},


	getScaleFactor: function(){
		var m = this, k = 'scaleFactor';
		try{
			return (m[k] = m[k] || this.getWidth());
		}
		catch(e){
			return 1;
		}
	},


	/**
	 * Clone the svg in normalized form. (viewBox of 0,0, 1,1)
	 */
	getThumbnail: function(){
        var id = guidGenerator(),
			div = document.createElement('div'),
			el = Ext.get(div),
            v = this.rendered ? this.saveScene() : this.value,
			svg, w;

		//This is a little dirty, but it gets the job done.
		div.setAttribute('id',id);
		div.setAttribute('style','display:none');
		document.body.appendChild(div);

		w = Ext.widget('whiteboard', {scaleFactor: 1, value: v, renderTo: id});
		svg = el.down('svg').dom.parentNode.innerHTML;

		w.destroy();
		el.remove();

		return svg.replace(/style=".*?"/ig,'')
					.replace(/<\/*svg[\s"\/\-=0-9a-z:\.;]*>/gi, '');
	},

    getSpriteClass: function(c, sides)
    {
        var m = {
            'CanvasPolygonShape': 'sprite-polygon',
            'CanvasCircleShape': 'sprite-ellipse'
        },
        s = m[c];

        //special case for lines
        if (s == m.CanvasPolygonShape && sides == 1)
            return 'sprite-line';
        return s;
    },

	loadScene: function(canvasJSON){
        //console.log('JSON canvas to load', JSON.stringify(canvasJSON));

		var shapes = Ext.clone( canvasJSON.shapeList ),
			s = this.getSurface(),
			w = this.getScaleFactor();

		Ext.each(shapes, function(shape, i){
            //TODO : opacity for fill and stroke are available, hook them up.
			var c = Color.cleanRGB(shape.fillColor) || Color.getColor(i),
				p =  Color.cleanRGB(shape.strokeColor) || c.getDarker(0.2),
				t = shape.transform,
				o, k;

			//scale up the matrix
			for(k in t) if(t.hasOwnProperty(k)) t[k] *= w;

			t = Ext.create('Ext.draw.Matrix',t.a,t.b,t.c,t.d,t.tx,t.ty).split();

			shape.strokeWidth = (shape.strokeWidth*w) || 3;

			o = Ext.widget(this.getSpriteClass(shape.Class, shape.sides),{
				sides: shape.sides,
				'stroke-width': shape.strokeWidth,
				stroke: p.toString(),
				fill: c.toString(),
				translate: {
					x: t.translateX,
					y: t.translateY
				},
				scale:{
					x: t.scaleX,
					y: t.scaleY
				},
				rotate: {
					degrees: Ext.draw.Draw.degrees(t.rotate)
				}
			});

			s.add(o).show(true);
			this.relay(o,'click');
			this.relay(o,'dblClick');

		}, this);
	},

	saveScene: function(){
		var shapes = [], s;

		this.getSurface().items.each(
			function(i){
				var a = Ext.clone(i.attr),
					bb = i.getBBox(),
					w = this.getScaleFactor(),
					o, k;

				if(i.isNib || a.hidden || (!bb.width && !bb.height))return;

				o = i.toJSON();

				//scale down the matrix
				for(k in o.transform){
					if(!o.transform.hasOwnProperty(k))continue;
					if(typeof o.transform[k] == 'number')
						o.transform[k] /= w;
				}

				if('strokeWidth' in o){
					o.strokeWidth /= w;
				}

				shapes.push(o);
			},
			this
		);

        s = { "Class":"Canvas", "shapeList": shapes };
        //console.log('save scene', JSON.stringify(s));

		return shapes.length===0 ? undefined : s;
	},

    getNumberOfShapes: function()
    {
        return this.getSurface().items.length;
    }
});
