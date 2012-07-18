Ext.define(	'NextThought.view.whiteboard.Canvas',{
	extend: 'Ext.Component',
	alias:	'widget.whiteboard-canvas',
	requires: [
		'NextThought.view.whiteboard.shapes.Circle',
		'NextThought.view.whiteboard.shapes.Line',
		'NextThought.view.whiteboard.shapes.Path',
		'NextThought.view.whiteboard.shapes.Polygon',
		'NextThought.view.whiteboard.shapes.Text',
		'NextThought.view.whiteboard.shapes.Url'
	],

	autoEl: 'canvas',

	objectNameRe: (/^Canvas(.+?)Shape$/i),

	initComponent: function(){
		this.callParent(arguments);
		this.updateData(this.drawData);
	},


	destroy: function(){
		this.el.removeAllListeners();
		this.callParent(arguments);
	},


	updateData: function(scene){
		this.drawData = Ext.clone(scene || {shapeList:[]});

		//maintain z-order since we're looping backwards (for speed)
		this.drawData.shapeList.reverse();

		var shapes = this.drawData.shapeList,
			i = shapes.length -1,
			p = 'NextThought.view.whiteboard.shapes.',
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
			shapes[i] = Ext.create(p+c[1],shapes[i]);
		}
	},


	getData: function(){
		if(!this.drawData){
			return null;
		}

		var data = {};

		data.shapeList	= [];
		data.MimeType	= "application/vnd.nextthought.canvas";
		data.Class		= 'Canvas';

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


	drawScene: function(finished){
		if(!this.drawData){
			return;
		}

		if(this.drawing){
			console.log('called while drawing');
			return;
		}

		function draw(x,cb){
			if(x<0){
				if(cb && cb.call){
					cb.call(this);
				}
				delete me.drawing;
				return;
			}
			ctx.save();
			shapes[x].draw(ctx, function(){
				ctx.restore();
				draw(x-1,cb);
			});
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

		this.drawing = true;
		draw(i,finished);
	},

	statics: {
		getThumbnail: function(scene, resultCallback){

			function finish(){
				var data = c.el.dom.toDataURL("image/png");

				try { c.destroy(); } catch(e){ console.warn(Globals.getError(e)); }
				try { div.remove(); }catch(e){ console.warn(Globals.getError(e)); }

				resultCallback.call(window,data);
			}

			var div = Ext.DomHelper.append(Ext.getBody(),{tag: 'div', style: {display:'none'}},true),
				c;

			c = Ext.widget({
				xtype:'whiteboard-canvas',
				drawData: scene,
				renderTo: div,
				thumbnail: true
			});

			c.el.dom.width = 1024;
			c.el.dom.height = 768;
			c.setSize(1024,768);
			c.drawScene(finish);
		}
	}
});
