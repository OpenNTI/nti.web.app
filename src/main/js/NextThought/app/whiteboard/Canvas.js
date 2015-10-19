/*globals swallow*/
Ext.define('NextThought.app.whiteboard.Canvas', {
	extend: 'Ext.Component',
	alias:	'widget.whiteboard-canvas',
	requires: [
		'NextThought.app.whiteboard.shapes.Circle',
		'NextThought.app.whiteboard.shapes.Line',
		'NextThought.app.whiteboard.shapes.Path',
		'NextThought.app.whiteboard.shapes.Polygon',
		'NextThought.app.whiteboard.shapes.Text',
		'NextThought.app.whiteboard.shapes.Url'
	],

	autoEl: 'canvas',

	initComponent: function() {
		this.callParent(arguments);
		this.updateData(this.drawData);
	},


	destroy: function() {
		if (this.el) {
			this.el.removeAllListeners();
		}
		this.callParent(arguments);
	},


	updateData: function(scene) {
		this.drawData = this.self.updateData(scene);

		if (scene && scene.viewportRatio) {
			this.viewportRatio = scene.viewportRatio;
		}
		else {
			this.viewportRatio = Globals.CANVAS_GOLDEN_RATIO;   //Default to this for new shapes.
		}
	},


	getData: function() {
		if (!this.drawData) {
			return null;
		}

		var data = {},
			shapes = this.drawData.shapeList,
			i = shapes.length - 1;

		data.shapeList	= [];
		data.MimeType	= 'application/vnd.nextthought.canvas';
		data.Class	= 'Canvas';
		data.viewportRatio = this.viewportRatio;
		data.NTIID = this.drawData.NTIID;


		for (i; i >= 0; i--) {
			data.shapeList.push(shapes[i].getJSON());
		}

		return data;
	},


	afterRender: function() {
		this.callParent();
		this.mon(this, 'resize', this.hasResized, this);
	},

	hasResized: function(cmp, width, height) {
		height = Math.round(width / (this.viewportRatio || 1));

		this.el.setStyle({
			width: width + 'px',
			height: height + 'px'
		});

		this.el.set({
			width: width,
			height: height
		});

		var me = this;

		setTimeout(function() {
			me.drawScene();
		},1);
	},


	drawScene: function(finished) {
		if (!this.drawData) {
			return;
		}

		if (this.drawing) {
			console.log('called while drawing');
			return;
		}

		this.drawing = true;

		var me = this;

		function fin() {
			delete me.drawing;
			Ext.callback(finished);
		}

		this.self.drawScene(this.drawData, this.el, fin);
	},


	makeShape: function(data) {
		return this.self.makeShape(data);
	},


	addShape: function(shape) {
		this.drawData.shapeList.unshift(shape);
	},

	statics: {
		objectNameRe: (/^Canvas(.+?)Shape$/i),

		updateData: function(scene) {
			var shapes, i,
				drawData = Ext.clone(scene || {shapeList: []});

			//maintain z-order since we're looping backwards (for speed)
			drawData.shapeList.reverse();

			shapes = drawData.shapeList;
			i = shapes.length - 1;

			for (i; i >= 0; i--) {
				shapes[i] = this.makeShape(shapes[i]);
			}

			return drawData;
		},


		makeShape: function(data) {
			//reparent shapes
			var c = (this.objectNameRe.exec(data.Class) || [])[1];
			if (!c) {
				console.warn('Not a shape: ' + JSON.stringify(data));
				return null;
			}

			if (c === 'Polygon' && data.sides <= 2) {
				c = 'Line';
			}
			c = NextThought.app.whiteboard.shapes[c];
			return c ? c.create(data) : null;
		},


		drawScene: function(data, canvas, finished) {

			function draw(x, cb) {
				if (x < 0) {
					if (cb && cb.call) {
						cb.call(this);
					}
					return;
				}
				ctx.save();
				shapes[x].draw(ctx, function() {
					ctx.restore();
					draw(x - 1, cb);
				});
			}

			var c = canvas.dom,
				w = c.width,
				h = c.height,
				ctx,
				shapes = data.shapeList || [],
				i = shapes.length - 1;

			//reset context
			c.width = 1; c.width = w;
			c.height = h;

			ctx = c.getContext('2d');

			ctx.save();
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, w, h);
			ctx.restore();

			draw(i, finished);
		},


		getThumbnail: function(scene, resultCallback) {

			function finish() {
				var data = Globals.CANVAS_BROKEN_IMAGE.src;
				try { data = c.dom.toDataURL('image/png'); } catch (er) {swallow(er);}
				try { c.remove(); }catch (e) { console.warn(Globals.getError(e)); }
				resultCallback.call(window, data);
			}

			var c = Ext.DomHelper.append(Ext.getBody(), {tag: 'canvas', style: {visibility: 'hidden', position: 'absolute'}},true),
				width = 580,
				height = width / (scene.viewportRatio || 1);

			c.dom.width = width;
			c.dom.height = height;

			this.drawScene(this.updateData(scene), c, finish);
		}
	}
});
