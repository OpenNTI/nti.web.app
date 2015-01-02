Ext.define('NextThought.view.courseware.overview.parts.Timeline', {
	extend: 'NextThought.view.cards.Card',
	alias: 'widget.course-overview-ntitimeline',

	requires: 'NextThought.ux.TimelineWindow',


	initComponent: function() {
		this.callParent(arguments);

		var root = this.locationInfo.root,
			width = this['suggested-width'],
			height = this['suggested-height'];

		height = height ? parseInt(height, 10) : -1;
		width = width ? parseInt(width, 10) : -1;

		this.data = {
			thumbnail: root + this.icon,
			description: this.desc,
			title: this.label,
			json: root + this.href,
			desiredHeight: height,
			desiredWidth: width,
			ntiid: this.ntiid,
			course: this.__getActiveBundle()
		};
	},

	__getActiveBundle: function() {
		return this.course && this.course.getId();
	},

	//always open this up in app
	shouldOpenInApp: function() { return true; },

	onCardClicked: function() {
		var me = this,
			win = Ext.widget('timeline-window', me.data);

		me.mon(win, 'close', me.setProgress);

		win.show();
	},

	setProgress: function(progress) {
		var progress = progress && progress[this.ntiid],
			hasBeenViewed = AnalyticsUtil.hasBeenViewed(this.ntiid);

		if (progress) {
			hasBeenViewed = hasBeenViewed || progress.AbsoluteProgress > 0;
		}

		if (hasBeenViewed) {
			this.addCls('viewed');
		}
	}
});
