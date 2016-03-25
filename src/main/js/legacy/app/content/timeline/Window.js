var Ext = require('extjs');
var AnalyticsUtil = require('../../../util/Analytics');
var ModelTimeline = require('../../../model/Timeline');
var WindowsStateStore = require('../../windows/StateStore');
var ComponentsHeader = require('./components/Header');
var UtilAnalytics = require('../../../util/Analytics');


module.exports = exports = Ext.define('NextThought.app.content.timeline.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.timeline-window',
	cls: 'timeline-window',
	doNotCenter: true,
	layout: 'none',
	defaultWidth: 792,
	defaultHeight: 595,
	defaultRatio: 1.333,

	// 4:3


	initComponent: function () {
		this.callParent(arguments);

		var me = this,
			size = me.calcSize(me.record.get('desiredWidth') || -1, me.record.get('desiredHeight') || -1);

		me.setWidth(size[0]);
		me.setHeight(size[1]);

		me.add({
			xtype: 'timeline-header',
			doClose: me.handleClose.bind(me)
		});

		me.timelineHeight = size[1] - 70 - 40;

		me.timelineContainer = me.add({
			xtype: 'box',
			name: 'timeline-container',
			cls: 'timeline-container'
		});

		me.add({
			xtype: 'container',
			cls: 'nti-window-footer',
			items: [
				{
					xtype: 'box',
					autoEl: {cls: 'close-btn', html: 'Close'},
					afterRender: function () {
						this.mon(this.el, 'click', me.handleClose.bind(me));
					}
				}
			]
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		createStoryJS({
			source: this.record.get('href'),
			embed_id: this.timelineContainer.id,
			height: this.timelineHeight
		});

		AnalyticsUtil.getResourceTimer(this.record.get('NTIID'), {type: 'resource-viewed'});
	},

	handleClose: function () {
		AnalyticsUtil.stopResourceTimer(this.record.get('NTIID'), 'resource-viewed');

		this.doClose();
	},

	calcSize: function (desiredWidth, desiredHeight) {
		var maxHeight = Ext.Element.getViewportHeight() - 70 - 20, //account for the navigation header, and 10px padding
			maxWidth = Ext.Element.getViewportWidth() - 20,//account for the 10px padding
			size = [];

		//if both are less than 0 nothing is suggested
		//so fill the screen
		if (desiredWidth < 0 && desiredHeight < 0) {
			size = [maxWidth, maxHeight];
		} else if (desiredWidth < 0) {
			//if we were passed a suggested height but not width
			//size it to the default ratio
			size = this.sizeToRatio(this.defaultRatio, desiredHeight * this.defaultRatio, maxWidth, maxHeight);
		} else if (desiredHeight < 0) {
			//if we were passed a suggested width but not height
			//size it to the default ratio
			size = this.sizeToRatio(this.defaultRatio, desiredWidth, maxWidth, maxHeight);
		} else if (desiredWidth < maxWidth && desiredHeight < maxHeight) {
			//if they are both less than the max then just use the desired dimensions
			size = [desiredWidth, desiredHeight];
		} else {
			//otherwise find the biggest dimenesions that fit
			size = this.sizeToRatio(desiredWidth / desiredHeight, desiredWidth, maxWidth, maxHeight);
		}

		return size;
	},

	sizeToRatio: function (ratio, desiredWidth, maxWidth, maxHeight) {
		var width = Math.min(maxWidth, desiredWidth),
			height = width / ratio;

		while (height > maxHeight) {
			width -= 10;
			height = Math.round(width / ratio);
		}

		this.desiredWidth = height;
		this.desiredWidth = width;

		return [width, height];
	}
}, function () {
	NextThought.app.windows.StateStore.register(NextThought.model.Timeline.mimeType, this);
});
