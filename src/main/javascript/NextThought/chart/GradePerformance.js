//See http://jsfiddle.net/jsg2021/6yfw8/ for a demo
Ext.define('NextThought.chart.GradePerformance', {
	extend: 'Ext.Component',
	alias: 'widget.grade-performance',
	ui: 'course-assessment',
	cls: 'performance',

	autoEl: {
		tag: 'canvas'
	},

	config: {
		averageColor: '#b8b8b8',
		averageWidth: 3,
		gradeColor: '#8eb737',
		gradeWidth: 4,
		store: null
	},

	afterRender: function() {
		this.callParent(arguments);
		this.canvas = Ext.getDom(this.el);
		this.viewWidth = this.el.getWidth();
		this.viewHeight = this.el.getHeight();
		this.canvas.width = this.viewWidth * 2;
		this.canvas.height = this.viewHeight * 2;
		this.context = this.canvas.getContext('2d');
		this.context.imageSmoothingEnabled = true;

		if (!this.context.setLineDash) {
			this.context.setLineDash = function() {};
		}

		this.drawAverages();
		this.drawGrades();
	},


	drawAverages: function() {
		var ctx = this.context;
		ctx.save();
		try {
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.beginPath();
			ctx.setLineDash([10, 4]);
			ctx.strokeStyle = this.getAverageColor();
			ctx.lineWidth = this.getAverageWidth();
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
			this.drawLine('Grade');
		} finally {
			ctx.restore();
		}
	},


	drawLine: function(property) {
		var pointDistance = (this.canvas.width / (this.store.getCount() - 1)),
			h = this.canvas.height,
			currentX = 0,
			ctx = this.context;

		this.store.each(function(rec, x) {
			var y = (rec.get(property) / 100) * h;
			ctx[x === 0 ? 'moveTo' : 'lineTo'](currentX, y);
			currentX += pointDistance;
		});

		ctx.stroke();
	}

});
