export default Ext.define('NextThought.app.course.overview.components.parts.Timeline', {
	extend: 'NextThought.common.components.cards.Card',
	alias: 'widget.course-overview-ntitimeline',

	requires: [
		'NextThought.model.Timeline',
		'NextThought.app.windows.Actions'
	],


	initComponent: function() {
		this.callParent(arguments);

		var root = this.locationInfo.root,
			width = this['suggested-width'],
			height = this['suggested-height'],
			thumbURL = this.icon.indexOf(root) === -1 ? root + this.icon : this.icon,
			jsonURL = this.href.indexOf(root) === -1 ? root + this.href : this.href;

		height = height ? parseInt(height, 10) : -1;
		width = width ? parseInt(width, 10) : -1;

		this.WindowActions = NextThought.app.windows.Actions.create();

		this.data = {
			thumbnail: thumbURL,
			description: this.desc,
			title: this.label,
			json: jsonURL,
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
			model = NextThought.model.Timeline.fromOutlineNode(this.data);

		this.WindowActions.pushWindow(model, null, this.el, {
			afterClose: this.setProgress.bind(this, null)
		});
	},

	setProgress: function(progress) {
		progress = progress || this.progress;

		this.progress = progress;

		if (!progress) { return; }

		var beenViewed = progress.hasBeenViewed(this.ntiid);

		if (beenViewed) {
			this.addCls('viewed');
		}
	}
});
