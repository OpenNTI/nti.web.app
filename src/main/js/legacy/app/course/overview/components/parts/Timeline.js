const Ext = require('@nti/extjs');

const WindowsActions = require('legacy/app/windows/Actions');
const Timeline = require('legacy/model/Timeline');
const Globals = require('legacy/util/Globals');

require('legacy/common/components/cards/Card');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.parts.Timeline', {
	extend: 'NextThought.common.components.cards.Card',
	alias: 'widget.course-overview-ntitimeline',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'thumbnail', style: { backgroundImage: 'url({thumbnail})' }},
		{ cls: 'meta', cn: [
			{ cls: 'title', html: '{title}' },
			{ cls: 'byline', html: '{{{NextThought.view.cards.Card.by}}}' },
			{ cls: 'description', html: '{description}' }
		]}
	]),

	initComponent: function () {
		this.callParent(arguments);

		var basePath = this.course && this.course.getContentRoots && this.course.getContentRoots()[0],
			root = this.locationInfo && this.locationInfo.root || basePath,
			width = this['suggested-width'],
			height = this['suggested-height'],
			thumbURL = this.icon,
			jsonURL = this.href;

		if (Globals.ROOT_URL_PATTERN.test(jsonURL)) {
			jsonURL = Globals.getURL(jsonURL);
		} else {
			jsonURL = Globals.getURL((root || '') + thumbURL);
		}

		if (Globals.ROOT_URL_PATTERN.test(thumbURL)) {
			thumbURL = Globals.getURL(thumbURL);
		} else {
			thumbURL = Globals.getURL((root || '') + thumbURL);
		}

		height = height ? parseInt(height, 10) : -1;
		width = width ? parseInt(width, 10) : -1;

		this.WindowActions = WindowsActions.create();

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
		var model = Timeline.fromOutlineNode(this.data);

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
