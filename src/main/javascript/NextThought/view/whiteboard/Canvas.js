Ext.define(	'NextThought.view.whiteboard.Canvas',{
	extend: 'Ext.Component',
	alias:	'widget.whiteboard-canvas',
	requires: [
		'NextThought.view.whiteboard.shapes.Ellipse',
		'NextThought.view.whiteboard.shapes.Line',
		'NextThought.view.whiteboard.shapes.Path',
		'NextThought.view.whiteboard.shapes.Polygon',
		'NextThought.view.whiteboard.shapes.Text'
	],

	autoEl: { tag: 'canvas' },

	objectNameRe: (/^Canvas(.+?)Shape$/i),

	initComponent: function(){
		this.callParent(arguments);
		var shapes = NextThought.view.whiteboard.shapes;

		this.objectMap = {
			'Circle'	: shapes.Ellipse.prototype,
			'Line'		: shapes.Line.prototype,
			'Path'		: shapes.Path.prototype,
			'Polygon'	: shapes.Polygon.prototype,
			'Text'		: shapes.Text.prototype
		};
		this.updateData(this.drawData);
	},


	destroy: function(){
		this.callParent(arguments);
	},


	updateData: function(scene){
		this.drawData = Ext.clone(scene || {shapeList:[]});

		//maintain z-order since we're looping backwards (for speed)
		this.drawData.shapeList.reverse();

		var shapes = this.drawData.shapeList,
			i = shapes.length -1,
			p = '__proto__',
			c;

		for(; i>=0; i--){
			//reparent shapes
			c = this.objectNameRe.exec(shapes[i].Class);
			if(!c){
				console.warn('Not a shape: '+JSON.stringify(shapes[i]));
				continue;
			}

			if(c[1]==='Polygon' && shapes[i].sides<=2){
				c[1]='Line';
			}
			shapes[i][p] = this.objectMap[c[1]] || Object.prototype;
		}
	},


	getData: function(){
		if(!this.drawData){
			return null;
		}

		var data = Ext.clone(this.drawData);

		data.shapeList	= [];
		data.MimeType	= "application/vnd.nextthought.canvas";
		data['Class']	= 'Canvas';

		var shapes = this.drawData.shapeList,
			i = shapes.length -1;

		for(; i>=0; i--){
			data.shapeList.push(shapes[i].getJSON());
		}

		return data;
	},


	afterRender: function(){
		this.callParent();
		if(!this.thumbnail){
			this.drawScene();
			this.on('resize', this.drawScene, this);
		}
	},


	drawScene: function(){
		if(!this.drawData){
			return;
		}

		var me = this,
			c = me.el.dom,
			w = me.el.getWidth(),
			h = me.el.getHeight(),
			d = me.drawData,
			ctx,
			shapes = d.shapeList || [],
			i = shapes.length -1;

		//reset context
		c.width = 1; c.width = w;
		c.height = h;

		ctx = c.getContext('2d');

		if(!this.thumbnail){
			ctx.save();
			ctx.fillStyle = 'white';
			ctx.fillRect(0,0,w,h);
			ctx.restore();
		}

		for(; i>=0; i--){
			ctx.save();
			shapes[i].draw(ctx);
			ctx.restore();
		}


	},

	statics: {
		getThumbnail: function(scene){

			var data, El = Ext.Element,
				div = Ext.DomHelper.append(Ext.getBody(),{tag: 'div', style: 'visibility: hidden; position: absolute;'},true),
				c, s = Math.floor( Math.min( El.getViewportHeight(), El.getViewportWidth() ) * 0.8 );

			c = Ext.widget('whiteboard-canvas',{drawData: scene, renderTo: div, thumbnail: true});
			c.setSize(s,s);
			c.drawScene();

			data = c.el.dom.toDataURL("image/png");

			c.destroy();
			div.remove();

			return data;
		}
	}
});
