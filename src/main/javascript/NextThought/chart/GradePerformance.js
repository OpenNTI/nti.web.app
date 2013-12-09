//See http://jsfiddle.net/jsg2021/6yfw8/ for a demo
Ext.define('NextThought.chart.GradePerformance', {
	extend: 'Ext.Component',
	alias: 'widget.grade-performance-chart',
	ui: 'course-assessment',
	cls: 'performance',

	autoEl: {
		tag: 'canvas'
	},

	config: {
		averageColor: '#b8b8b8',
		averageWidth: 3,
		gradeColor: '#40b450',
		gradeWidth: 4,
		store: null,
		topMargin: 20,
		bottomMargin: 10,
		pixelDensity: 2
	},

	testAnimationProperties: function() {
		if (this.hasOwnProperty('canAnimate')) {
			return this.canAnimate;
		}

		var ctx = document.createElement('canvas').getContext('2d'),
			hasDashOffset = ctx.hasOwnProperty('lineDashOffset') || ctx.hasOwnProperty('mozDashOffset'),
			hasSetLineDash = !!ctx.setLineDash;

		return hasDashOffset && hasSetLineDash;
	},


	startAnimation: function() {
		this.canAnimate = this.testAnimationProperties();
		if (this.canAnimate && this.rendered) {
			this.animateTask.start();//safe to call repeatedly (will noop if already started)
		}
	},


	stopAnimation: function() {
		if (this.animateTask) {
			this.animateTask.stop();
		}
	},


	afterRender: function() {
		this.callParent(arguments);
		this.dashOffset = 0;
		this.canvas = Ext.getDom(this.el);
		this.viewWidth = this.el.getWidth();
		this.viewHeight = this.el.getHeight();
		this.canvas.width = this.viewWidth * this.getPixelDensity();
		this.canvas.height = this.viewHeight * this.getPixelDensity();
		this.context = this.canvas.getContext('2d');
		this.context.imageSmoothingEnabled = true;

		this.animateTask = Ext.TaskManager.newTask({
			run: this.redraw,
			interval: 50,
			scope: this
		});


		if (!this.context.setLineDash) {
			this.context.setLineDash = function(a) {};
		}

		this.setStore(this.store);

		this.on({
			destroy: 'stopAnimation',
			deactivate: 'stopAnimation',
			hide: 'stopAnimation',
			activate: 'startAnimation',
			show: 'startAnimation'
		});
	},



	applyStore: function(store) {
		Ext.destroy(this.storeListeners);
		delete this.storeListeners;
		if (store) {
			this.storeListeners = this.mon(store, {
				destroyable: true,
				datachanged: 'redraw'
			});
		}
		try {
			this.redraw();
			this.startAnimation();
		} catch (e) {
			console.warn(e.stack || e.message || e);
		}
		return store;
	},


	redraw: function() {
		var ctx = this.context;
		if (!ctx) {return;}

		ctx.canvas.width += 0; //set the canvas dirty and make it clear on next draw.
		this.drawAverages();
		this.drawGrades();
	},


	drawAverages: function() {
		this.dashOffset--;
		var ctx = this.context;
		ctx.save();
		try {
			ctx.lineDashOffset = this.dashOffset;
			ctx.mozDashOffset = this.dashOffset;
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.beginPath();
			ctx.setLineDash([10, 4]);
			ctx.strokeStyle = this.getAverageColor();
			ctx.lineWidth = this.getAverageWidth();

			//ctx.shadowColor = '#ccc';
			//ctx.shadowBlur = 5;
			//ctx.shadowOffsetX = 1;
			//ctx.shadowOffsetY = 1;
			this.drawLine('AverageGrade');
		} finally {
			ctx.restore();
		}
	},


	drawGrades: function() {
		var ctx = this.context;
		ctx.save();
		try {
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.beginPath();
			ctx.strokeStyle = this.getGradeColor();
			ctx.lineWidth = this.getGradeWidth();

			//ctx.shadowColor = '#666';
			//ctx.shadowBlur = 5;
			//ctx.shadowOffsetX = 1;
			//ctx.shadowOffsetY = 2;
			this.drawLine('Grade');
		} finally {
			ctx.restore();
		}
	},


	drawLine: function(property) {
		if (!this.store || !this.store.getCount()) {
			this.stopAnimation();
			console.warn('No data for chart:', this.id);
			return;
		}

		var pointDistance = (this.canvas.width / (this.store.getCount() - 1)),
			t = this.getTopMargin() * this.getPixelDensity(),
			h = this.canvas.height - (t + (this.getBottomMargin() * this.getPixelDensity())),
			currentX = 0,
			ctx = this.context;

		ctx.translate(0, t);

		this.store.each(function(rec, x) {
			var y = (rec.get(property) / 100) * h;
			ctx[x === 0 ? 'moveTo' : 'lineTo'](currentX, y);
			currentX += pointDistance;
		});

		ctx.stroke();
	}

});
