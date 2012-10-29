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

	initComponent: function(){
		this.callParent(arguments);
		this.updateData(this.drawData);
	},


	destroy: function(){
		if(this.el){
			this.el.removeAllListeners();
		}
		this.callParent(arguments);
	},


	updateData: function(scene){
		this.drawData = this.self.updateData(scene);

		if(scene && scene.viewportRatio){
			this.viewportRatio = scene.viewportRatio;
		}
		else{
			this.viewportRatio = Globals.CANVAS_GOLDEN_RATIO;   //Default to this for new shapes.
		}
	},


	getData: function(){
		if(!this.drawData){
			return null;
		}

		var data = {},
			shapes = this.drawData.shapeList,
			i = shapes.length -1;

		data.shapeList	= [];
		data.MimeType	= "application/vnd.nextthought.canvas";
		data.Class		= 'Canvas';
		data.viewportRatio = this.viewportRatio;


		for(i; i>=0; i--){
			data.shapeList.push(shapes[i].getJSON());
		}

		return data;
	},


	afterRender: function(){
		this.callParent();
		this.mon(this,'resize', this.hasResized, this);
	},

	hasResized: function(cmp,width,height){
		height = Math.round(width / (this.viewportRatio || 1));
		this.el.setStyle({
			width: width+'px',
			height: height +'px'
		});
		var me = this;
		setTimeout(function(){
			me.drawScene();
		},1);
	},


	drawScene: function(finished){
		if(!this.drawData){
			return;
		}

		if(this.drawing){
			console.log('called while drawing');
			return;
		}

		this.drawing = true;

		var me = this;

		function fin(){
			delete me.drawing;
			Ext.callback(finished);
		}

		this.self.drawScene(this.drawData,this.el,fin);
	},


	makeShape: function(data){
		return this.self.makeShape(data);
	},


	addShape: function(shape){
		this.drawData.shapeList.unshift(shape);
	},

	statics: {
		objectNameRe: (/^Canvas(.+?)Shape$/i),

		updateData: function(scene){
			var shapes, i,
				drawData = Ext.clone(scene || {shapeList:[]});

			//maintain z-order since we're looping backwards (for speed)
			drawData.shapeList.reverse();

			shapes = drawData.shapeList;
			i = shapes.length -1;

			for(i; i>=0; i--){
				shapes[i] = this.makeShape(shapes[i]);
			}

			return drawData;
		},


		makeShape: function(data){
			//reparent shapes
			var c = this.objectNameRe.exec(data.Class);
			if(!c){
				console.warn('Not a shape: '+JSON.stringify(data));
				return null;
			}

			if(c[1]==='Polygon' && data.sides<=2){
				c[1]='Line';
			}
			return Ext.create('NextThought.view.whiteboard.shapes.'+c[1],data);
		},


		drawScene: function(data, canvas, finished){

			function draw(x,cb){
				if(x<0){
					if(cb && cb.call){
						cb.call(this);
					}
					return;
				}
				ctx.save();
				shapes[x].draw(ctx, function(){
					ctx.restore();
					draw(x-1,cb);
				});
			}

			var c = canvas.dom,
				w = canvas.getWidth(),
				h = canvas.getHeight(),
				ctx,
				shapes = data.shapeList || [],
				i = shapes.length -1;

			//reset context
			c.width = 1; c.width = w;
			c.height = h;

			ctx = c.getContext('2d');

			ctx.save();
			ctx.fillStyle = 'white';
			ctx.fillRect(0,0,w,h);
			ctx.restore();

			draw(i,finished);
		},


		getThumbnail: function(scene, resultCallback){

			function finish(){
				var data = c.dom.toDataURL("image/png");
				try { c.remove(); }catch(e){ console.warn(Globals.getError(e)); }
				resultCallback.call(window,data);
			}

			var c = Ext.DomHelper.append(Ext.getBody(),{tag: 'canvas', style: {visibility:'hidden',position:'absolute'}},true);

			c.dom.width = 580;
			c.dom.height = 580 / (scene.viewportRatio || 1);

			this.drawScene(this.updateData(scene),c,finish);
		}
	}
});
