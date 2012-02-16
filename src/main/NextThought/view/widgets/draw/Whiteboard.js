Ext.define('NextThought.view.widgets.draw.Whiteboard', {
	extend		: 'Ext.panel.Panel',
	alias		: 'widget.whiteboard',
	requires	: [
		'Ext.draw.Component',
		'Ext.menu.ColorPicker',
		'NextThought.view.widgets.draw.Resizer',
		'NextThought.view.widgets.draw.Rotater',
		'NextThought.util.Color',
        'NextThought.view.widgets.draw.ShapeFactory'
	],

	cls: 'whiteboard',
	layout:'fit',
	items: { xtype: 'draw', viewBox: false },


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


	destroy: function(){
		var s = this.getSurface();
		if(s){s.removeAll(true);}
		this.callParent(arguments);
	},


	afterRender: function(){
		this.callParent(arguments);

		if(this.value){
			this.loadScene(this.value);
			delete this.value;
		}

		this.setColor('fill', 'FFFFFF');
		this.setColor('stroke', '000000');

		//pre-cache so that the value is known after the window is hidden and & immeasurable. (display: none makes all
		//measurements return 0, and we need display none so that the invisible window doesn't interfere with content
		//below it)
		this.getScaleFactor();
	},


	reset: function(){
		this.removeAll();
		if(this.initialConfig.value){
			this.loadScene(this.initialConfig.value);
		}
	},


	relativizeXY: function(xy){
		var p = this.down('draw').getPosition();

		xy[0]-=p[0];
		xy[1]-=p[1];
		return xy;
	},


	setColor: function(c, color){
		c = c.toLowerCase();
		this.selectedColor[c] = '#'+color;

		if(this.selection){
			var s = {};
			s[c] = color;
			this.selection.sprite[c] = '#'+color;
			this.selection.sprite.setAttributes(s,true);
		}

		this.down(Ext.String.format('button[action=pick-{0}-color]',c))
				.getEl()
				.down('.x-btn-icon')
				.setStyle({background: this.selectedColor[c]});
	},


	addShape: function(shape, x,y, strokeWidth, sides){
        var sp = ShapeFactory.createShape(this, shape, x, y, sides, this.selectedColor, strokeWidth);
        this.getSurface().add(sp).show(true);
		return sp;
	},


	getSelected: function(){
		var s = this.selection;
		return s ? s.sprite : null;
	},


	removeSelection: function(){
		if(!this.selection){return;}

		this.selection.sprite.destroy();

		this.selection.destroy();
		delete this.selection;
	},


	removeAll: function(){
		this.getSurface().removeAll(true);
	},


	select: function(sprite){
		var me = this,
			s = me.selection,
			prev = s ? s.sprite : null,
			xtype = s ? s.xtype : null;

		function next(){
			if(prev !== sprite){
				xtype = '';
			}

			switch(xtype){
				case '': return Ext.widget('sprite-resizer',me,sprite);
				case 'sprite-resizer': return Ext.widget('sprite-rotater',me,sprite);
				case 'sprite-rotater': break;
			}

			return null;
		}

		if(s){
			s.destroy();
			delete me.selection;
		}

		if(!sprite){return;}

		s = next();
		if(s){s.show(true);}
		me.selection = s;
	},


	getSurface: function(){
		return this.down('draw').surface;
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
	 *
	 * @param [value]
	 */
	getThumbnail: function(value){
        var id = guidGenerator(),
			div = document.createElement('div'),
            el = Ext.get(div),
            v = value || this.value || this.initialConfig.value,
            svg, w;

        //This is a little dirty, but it gets the job done.
        div.setAttribute('id',id);
        div.setAttribute('style','display:none');
        document.body.appendChild(div);

        w = Ext.widget('draw', {renderTo: id, id: id+'-thumbnail-surface',width: 1, height:1});
		this.loadScene.call(w, v,w.surface,1,w);
        svg = el.down('svg').dom.parentNode.innerHTML;

		w.surface.removeAll(true);
        w.destroy();
        el.remove();

		return svg.replace(/style=".*?"/ig,'')
				.replace(/id="ext\-.*?"/ig,'')
				.replace(/<defs><\/defs>/gi, '')
				.replace(/<rect(.+?)"100%"(.+?)"100%"(.*?)><\/rect>/gi, '')
				.replace(/<\/*svg[\s"\/\-=0-9a-z:\.;]*>/gi, '');

	},


	/**
	 *
	 * @param canvasJSON
	 * @param [surface]
	 * @param [scale]
	 * @param [context]
	 */
	loadScene: function(canvasJSON, surface, scale, context){
        console.log('JSON canvas to load', JSON.stringify(canvasJSON));
		var shapes = Ext.clone( canvasJSON.shapeList ),
			s = surface || this.getSurface(),
			w = scale || this.getScaleFactor(),
            me = context || this;

		Ext.each(shapes, function(shape){
			var x = ShapeFactory.restoreShape(me, shape, w);
			x = s.add(x);
			x.show(true);
		});
	},

	saveScene: function(){
		var shapes = [], s, ab = this.artBoard;

		this.getSurface().items.each(
			function(i){
				var a = Ext.clone(i.attr),
					bb = i.getBBox(),
					w = this.getScaleFactor(),
					o;

				if(i===ab || i.isNib || a.hidden || (!bb.width && !bb.height)){return;}

                o = ShapeFactory.scaleJson(1/w, i.toJSON(w));

                o.strokeWidth = o.strokeWidthTarget + '%';
                delete o.strokeWidthTarget;

				shapes.push(o);
			},
			this
		);

        s = { "Class":"Canvas", "shapeList": shapes };

        //console.log('save scene', JSON.stringify(s));
		return shapes.length===0 ? undefined : s;
	},

    getNumberOfShapes: function() {
        return this.getSurface().items.length;
    }
},
function(){
	//make these functions stactically available
	this.loadScene = this.prototype.loadScene;
	this.getThumbnail = this.prototype.getThumbnail;
});
