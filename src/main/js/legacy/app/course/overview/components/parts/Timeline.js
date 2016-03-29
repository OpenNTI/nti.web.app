var Ext = require('extjs');
var CardsCard = require('../../../../../common/components/cards/Card');
var ModelTimeline = require('../../../../../model/Timeline');
var WindowsActions = require('../../../../windows/Actions');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.parts.Timeline', {
	extend: 'NextThought.common.components.cards.Card',
	alias: 'widget.course-overview-ntitimeline',

	initComponent: function () {
		this.callParent(arguments);

		var basePath = this.course && this.course.getContentRoots && this.course.getContentRoots()[0],
			root = this.locationInfo && this.locationInfo.root || basePath,
			width = this['suggested-width'],
			height = this['suggested-height'],
			thumbURL = root && this.icon && this.icon.indexOf(root) === -1 ? root + this.icon : this.icon,
			jsonURL = root && this.href && this.href.indexOf(root) === -1 ? root + this.href : this.href;

		height = height ? parseInt(height, 10) : -1;
		width = width ? parseInt(width, 10) : -1;

		this.WindowActions = NextThought.app.windows.Actions.create();

		this.data = {
			thumbnail: thumbURL,
			description: this.desc,
			title: this.label,
			json: jsonURL,
			href: jsonURL,
			desiredHeight: height,
			desiredWidth: width,
			ntiid: this.ntiid,
			course: this.__getActiveBundle()
		};
	},

	__getActiveBundle: function () {
		return this.course && this.course.getId();
	},

	//always open this up in app
	shouldOpenInApp: function () { return true; },

	onCardClicked: function () {
		var me = this,
			model = NextThought.model.Timeline.fromOutlineNode(this.data);

		this.WindowActions.pushWindow(model, null, this.el, {
			afterClose: this.setProgress.bind(this, null)
		});
	},

	setProgress: function (progress) {
		progress = progress || this.progress;

		this.progress = progress;

		if (!progress) { return; }

		var beenViewed = progress.hasBeenViewed(this.ntiid);

		if (beenViewed && !this.isDestroyed) {
			this.addCls('viewed');
		}
	}
});
