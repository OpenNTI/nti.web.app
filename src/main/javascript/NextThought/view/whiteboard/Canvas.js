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
		this.el.removeAllListeners();
		this.callParent(arguments);
	},


	updateData: function(scene){
		this.drawData = this.self.updateData(scene);
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
		this.mon(this,'resize', this.hasResized, this);
	},

	hasResized: function(cmp,width,height){

		this.el.set({
			width: width,
			height: width
		});
		this.el.setStyle({
			width: width+'px',
			height: width+'px'
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

		//Ensure that w === h to obey  a 1-1 drawing model.
		me.el.setHeight(me.el.getWidth());

		this.self.drawScene(this.drawData,this.el,fin);
	},

	statics: {
		objectNameRe: (/^Canvas(.+?)Shape$/i),

		updateData: function(scene){
			var drawData = Ext.clone(scene || {shapeList:[]});

			//maintain z-order since we're looping backwards (for speed)
			drawData.shapeList.reverse();

			var shapes = drawData.shapeList,
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

			return drawData;
		},



		drawScene: function(data, canvas, finished, thumbnail){

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

			if(!thumbnail){
				ctx.save();
				ctx.fillStyle = 'white';
				ctx.fillRect(0,0,w,h);
				ctx.restore();
			}

			draw(i,finished);
		},


		getThumbnail: function(scene, resultCallback){

			function finish(){
				var data = c.dom.toDataURL("image/png");
				resultCallback.call(window,data);
			}

			var c = this.thumbnailCanvas;

			c.dom.width = 580;
			c.dom.height = 580;

			this.drawScene(this.updateData(scene),c,finish, true);
		}
	}
},
function(){
    this.thumbnailCanvas = Ext.DomHelper.append(Ext.getBody(),{tag: 'canvas', style: {zIndex: -999, visibility:'hidden',position:'absolute'}},true);
});
