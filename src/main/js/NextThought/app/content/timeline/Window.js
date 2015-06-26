Ext.define('NextThought.app.content.timeline.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.timeline-window',

	requires: [
		'NextThought.model.Timeline',
		'NextThought.app.windows.StateStore',
		'NextThought.app.content.timeline.components.Header'
	],

	cls: 'timeline-window',
	doNotCenter: true,

	defaultWidth: 792,
	defaultHeight: 595,
	defaultRatio: 1.333, // 4:3


	initComponent: function() {
		this.callParent(arguments);

		var me = this,
			size = me.calcSize(me.record.get('desiredWidth') || -1, me.record.get('desiredHeight') || -1);

		me.setWidth(size[0]);
		me.setHeight(size[1]);

		me.add({
			xtype: 'timeline-header'
		});

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
					autoEl: {cls: 'close-btn'},
					afterRender: function() {
						this.mon(this.el, 'click', me.doClose.bind(me));
					}
				}
			]
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		createStoryJS({
			source: this.record.get('href'),
			embed_id: this.timelineContainer.id
		});
	},


	calcSize: function(desiredWidth, desiredHeight) {
		var maxHeight = Ext.Element.getViewportHeight() - 70 - 20, //account for the header and 10px padding
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


	sizeToRatio: function(ratio, desiredWidth, maxWidth, maxHeight) {
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
}, function() {
	NextThought.app.windows.StateStore.register(NextThought.model.Timeline.mimeType, this);
});
