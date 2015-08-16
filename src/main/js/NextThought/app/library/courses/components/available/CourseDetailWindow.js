Ext.define('NextThought.app.library.courses.components.available.CourseDetailWindow', {
	extend: 'NextThought.app.library.courses.components.available.CourseWindow',

	isSingle: true,

	initComponent: function() {
		this.callParent(arguments);

		var me = this;
		// Go ahead and show the course detail window
		me.showCourse(this.record);
		wait()
			.then(me.show.bind(me));
	},

	onBeforeClose: function() {
		var me = this,
			active = me.getLayout().getActiveItem(),
			warning;

		if (active && active.stopClose) {
			warning = active.stopClose();
		}

		if (warning) {
			warning
				.then(function() {
					me.doClose();
				});
			return false;
		}
	},

	addMask: function() {},

	handleClose: function() {
		this.doClose();
	},

	/**
	 * Ext is shooting us in the foot when it tries to center it
	 * so for now just don't let Ext do anything here.
	 */
	setPosition: function() {},


	/**
	 * This is always going to be positioned  fixed, so don't
	 * let Ext layout try to calculate according to parents.
	 */
	center: function() {
		if (!this.rendered) {
			this.on('afterrender', this.center.bind(this));
			return;
		}

		var myWidth = this.getWidth(),
			myHeight = this.getHeight(),
			viewWidth = Ext.Element.getViewportWidth(),
			viewHeight = Ext.Element.getViewportHeight(),
			top, left;

		top = (viewHeight - myHeight) / 2;
		left = (viewWidth - myWidth) / 2;

		top = Math.max(top, 0);
		left = Math.max(left, 0);

		this.setY(top);
		this.setX(left);
	}

}, function() {
	NextThought.app.windows.StateStore.register(NextThought.model.courses.CourseCatalogEntry.mimeType, this);
});
