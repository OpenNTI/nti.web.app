Ext.define('NextThought.ux.Pointer', {
	extend: 'Ext.Component',
	alias: 'widget.pointer',

	autoRender: true,
	autoEl: {
		tag: 'div'
	},

	baseCmp: null,
	targetEl: null,

	ui: 'nt',
	cls: 'pointer',
	shadowBuffer: 3,

	afterRender: function() {
		this.callParent(arguments);

		if (!this.getPointerStyle) {
			this.getPointerStyle = Ext.emptyFn;
		}

		this.point();

		this.mon(this.baseCmp, {
			scope: this,
			move: this.point
		});

		this.mon(Ext.get(this.pointToEl).getScrollingEl(), {
			scroll: this.point,
			scope: this
		});
	},


	disable: function() {
		this.hide();
		return this.callParent();
	},


	show: function() {
		if (!this.disabled) {
			this.callParent(arguments);
		}
		return this;
	},


	point: function() {
		if (!this.rendered || this.disabled) {
			return;
		}


		var bEl = this.baseCmp.getEl(),
			bTop = bEl.getY() + this.shadowBuffer,
			bBottom = (bEl.getY() + bEl.getHeight()) - this.shadowBuffer,

			h = this.getHeight(),
			x = this.el.getAlignToXY(bEl, 'l-r', [-2, 0])[0],
			y = this.el.getAlignToXY(this.pointToEl, 'r-l', [0, 1])[1],

			bottom = y + (h - this.shadowBuffer),
			z = this.baseCmp.el.getZIndex() + 1;

		if (bottom >= bBottom || y < bTop) {
			z -= 2;
			y = null;
			x -= this.getWidth();
		}


		this.el.setStyle({zIndex: z});
		this.removeCls('grey contact');
		this.addCls(this.getPointerStyle(x, y + (h / 2)));
		this.setPagePosition(x, y, false);
	}
});
