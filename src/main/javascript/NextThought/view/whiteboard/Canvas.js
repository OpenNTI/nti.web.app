Ext.define(	'NextThought.view.whiteboard.Canvas',{
	extend: 'Ext.Component',
	alias:	'widget.whiteboard-canvas',
	requires: [
		'NextThought.view.whiteboard.shapes.Ellipse',
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
			shapes[i][p] = this.objectMap[c[1]] || Object.prototype;
		}
	},


	getData: function(){
		if(!this.drawData){
			return null;
		}

		var data = Ext.clone(this.drawData);

		//maintain z-order since we're looping backwards (for speed)
		data.shapeList.reverse();

		var shapes = data.shapeList,
			i = shapes.length -1,
			p = '__proto__';

		for(; i>=0; i--){
			//reparent shapes
			shapes[i][p] = Object.prototype;
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

			console.log(c.getSize(),'thumbnail image: ',data);

			c.destroy();
			div.remove();

			return data;
		},


		test: function(){
			var testWhiteboard =
					{
						"Class":"Canvas",
						"shapeList":[
							{
								"Class":"CanvasPolygonShape",
								"sides":6,
								"fillColor": 'rgb(255,0,0)',
								"strokeColor": 'None',
								"strokeWidth":"0.005471956224350205%",
								"transform":{
									"Class":"CanvasAffineTransform",
									"a":0.151,
									"b":0,
									"c":0,
									"d":0.151,
									"tx":0.1,
									"ty":0.1
								}
							},
							{
								"Class":"CanvasCircleShape",
								"fillColor": '#004400',
								"strokeColor": '#0000dd',
								"strokeWidth":"0.001471956224350205%",
								"transform":{
									"Class":"CanvasAffineTransform",
									"a":0.151,
									"b":0,
									"c":0,
									"d":0.151,
									"tx":0.3,
									"ty":0.1
								}
							},
							{
								"Class":"CanvasPolygonShape",
								"sides":1,
								"fillColor": 'None',
								"strokeColor": '#000000',
								"strokeWidth":"0.05471956224350205%",
								"transform":{
									"Class":"CanvasAffineTransform",
									"a":0.15,
									"b":0,
									"c":0,
									"d":1,
									"tx":0.5,
									"ty":0.1
								}
							},
							{
								"Class":"CanvasPathShape",
								"transform":{
									"Class":"CanvasAffineTransform",
									"a":0.9,
									"b":0,
									"c":0,
									"d":0.9,
									"tx":0.28727770177838574,
									"ty":0.07113543091655267},
								"closed":false,
								"points":[0,0,-0.0013679890560875513,0,-0.005471956224350205,0,-0.015047879616963064,0,-0.030095759233926128,0,-0.03967168262653899,0,-0.049247606019151846,0,-0.0533515731874145,0,-0.057455540355677154,0,-0.058823529411764705,0,-0.06292749658002736,0,-0.06703146374829001,0.0027359781121751026,-0.07250341997264022,0.004103967168262654,-0.07934336525307797,0.006839945280437756,-0.08207934336525308,0.008207934336525308,-0.08618331053351573,0.009575923392612859,-0.08891928864569083,0.01094391244870041,-0.09302325581395349,0.015047879616963064,-0.09439124487004104,0.016415868673050615,-0.09712722298221614,0.02051983584131327,-0.09712722298221614,0.024623803009575923,-0.09712722298221614,0.025991792065663474,-0.09712722298221614,0.028727770177838577,-0.09712722298221614,0.03146374829001368,-0.09712722298221614,0.03419972640218878,-0.09712722298221614,0.03556771545827633,-0.09712722298221614,0.03967168262653899,-0.09712722298221614,0.03967168262653899,-0.09712722298221614,0.04103967168262654,-0.09712722298221614,0.04240766073871409,-0.09302325581395349,0.04514363885088919,-0.09165526675786594,0.049247606019151846,-0.08618331053351573,0.05198358413132695,-0.08207934336525308,0.0560875512995896,-0.07660738714090287,0.058823529411764705,-0.07250341997264022,0.06155950752393981,-0.06703146374829001,0.06429548563611491,-0.06566347469220246,0.06429548563611491,-0.06155950752393981,0.06566347469220246,-0.057455540355677154,0.06839945280437756,-0.0533515731874145,0.06839945280437756,-0.047879616963064295,0.06976744186046512,-0.04377564979480164,0.06976744186046512,-0.03967168262653899,0.07113543091655267,-0.03146374829001368,0.07113543091655267,-0.025991792065663474,0.07250341997264022,-0.017783857729138167,0.07250341997264022,-0.008207934336525308,0.07250341997264022,-0.0027359781121751026,0.07523939808481532,0.005471956224350205,0.07660738714090287,0.012311901504787962,0.07660738714090287,0.017783857729138167,0.07934336525307797,0.025991792065663474,0.08071135430916553,0.036935704514363885,0.08618331053351573,0.049247606019151846,0.09439124487004104,0.057455540355677154,0.1012311901504788,0.06292749658002736,0.10807113543091655,0.06566347469220246,0.11354309165526676,0.06839945280437756,0.11764705882352941,0.06839945280437756,0.12175102599179206,0.07113543091655267,0.12859097127222982,0.07113543091655267,0.13406292749658003,0.07113543091655267,0.1409028727770178,0.07113543091655267,0.14774281805745554,0.07113543091655267,0.15321477428180574,0.07113543091655267,0.16005471956224349,0.06839945280437756,0.16415868673050615,0.06566347469220246,0.1709986320109439,0.06155950752393981,0.17510259917920656,0.05471956224350205,0.18057455540355677,0.04514363885088919,0.1874145006839945,0.03283173734610123,0.19151846785225718,0.019151846785225718,0.19562243502051985,0.0013679890560875513,0.19699042407660738,-0.028727770177838577,0.20109439124487005,-0.04514363885088919,0.20109439124487005,-0.06155950752393981,0.20109439124487005,-0.06976744186046512,0.20109439124487005,-0.08207934336525308,0.20109439124487005,-0.09028727770177838,0.20109439124487005,-0.09575923392612859,0.20109439124487005,-0.09986320109439124,0.1997264021887825,-0.1012311901504788,0.19835841313269492,-0.1012311901504788,0.19835841313269492],
								"strokeColor":"rgb(0,0,0)",
								"strokeOpacity":1,
								"fillColor":"None",
								"fillOpacity":1,
								"strokeWidth":"0.005471956224350205%"
							}
						]
					},
				w = Ext.widget('window',{
						width: 400,
						height: 400,
						maximizable: true,
						layout: 'fit',
						items: {
							xtype:'whiteboard-canvas',
							drawData: testWhiteboard
						}
					});
			w.show();
		}
	}
});
