export default Ext.define('NextThought.common.ux.TimelineWindow', {
	extend: 'NextThought.common.window.Window',
	alias: 'widget.timeline-window',

	cls: 'timeline-window',

	layout: 'fit',
	header: false,

	defaultWidth: 792,
	defaultHeight: 595,
	defaultRatio: 1.333, // 4:3

	items: [
		{
			xtype: 'box',
			name: 'timeline-container',
			cls: 'timeline-container'
		}
	],

	dockedItems: {
		xtype: 'container',
		dock: 'bottom',
		ui: 'footer',
		height: 40,
		baseCls: 'nti-window',
		layout: {
			type: 'hbox',
			align: 'stretchmax'
		},
		defaults: {
			cls: 'footer-region',
			xtype: 'container',
			flex: 1,
			layout: 'hbox'
		},
		items: [{
			layout: 'auto',
			defaults: { xtype: 'button', ui: 'blue', scale: 'large'},
			items: [
				//{text: 'Save', cls: 'x-btn-flat-large save', action: 'save', href: '{url}', style: { float: 'left'}},
				{ xtype: 'box', cls: 'iframe-save', save: true, autoEl: { tag: 'a', href: '{url}', html: '', target: '_blank'}},
				{
					text: 'Close',
					height: 40,
					cls: 'x-btn-blue-large dismiss',
					action: 'cancel',
					style: { 'float': 'right'},
					handler: function(b, e) {
						e.stopEvent(); b.up('window').close();
					}
				}
			]
		}]
	},


	afterRender: function() {
		this.callParent(arguments);

		this.timelineContainer = this.down('[name=timeline-container]');

		createStoryJS({
			source: this.json,
			embed_id: this.timelineContainer.id
		});

		this.sizeWindow(this.desiredWidth, this.desiredHeight);

		this.on({
			show: 'startTimer',
			beforeclose: 'endTimer'
		});
	},


	startTimer: function() {
		var data = {
				type: 'resource-viewed',
				resource_id: this.ntiid
			};

		if (this.ntiid) {
			AnalyticsUtil.getResourceTimer(data.resource_id, data);
		}
	},


	endTimer: function() {
		if (this.ntiid) {
			AnalyticsUtil.stopResourceTimer(this.ntiid, 'resource-viewed');
		}
	},

	/**
	 * Size the timeline window according to the suggested and screen dimensions
	 * @param  {Number} desiredWidth  suggested width
	 * @param  {Number} desiredHeight suggested height
	 */
	sizeWindow: function(desiredWidth, desiredHeight) {
		var maxHeight = Ext.Element.getViewportHeight() - 20, //10px padding on top and bottom
			maxWidth = Ext.Element.getViewportWidth() - 40; //20px padding on the left and right

		//if both are less than 0 then nothing was suggested
		//so fill the screen
		if (desiredWidth < 0 && desiredHeight < 0) {
			this.setWidth(maxWidth);
			this.setHeight(maxHeight);
		} else if (desiredWidth < 0) {
			//if we were passed a suggested height but not width
			//size it to the default ratio
			this.sizeToRatio(this.defaultRatio, desiredHeight * this.defaultRatio, maxWidth, maxHeight);
		} else if (desiredHeight < 0) {
			//if we were passed a suggested width but not height
			//size it to the default ratio
			this.sizeToRatio(this.defaultRatio, desiredWidth, maxWidth, maxHeight);
		} else if (desiredWidth < maxWidth && desiredHeight < maxHeight) {
			//if they are both less than the max then just use the desired dimensions
			this.setWidth(desiredWidth);
			this.setHeight(desiredHeight);
		} else {
			//otherwise find the biggest dimensions that fit
			this.sizeToRatio(desiredWidth / desiredHeight, desiredWidth, maxWidth, maxHeight);
		}
	},


	sizeToRatio: function(ratio, desiredWidth, maxWidth, maxHeight) {
		var width = Math.min(maxWidth, desiredWidth),
			height = width / ratio;

		while (height > maxHeight) {
			width -= 10;
			height = Math.round(width / ratio);
		}

		this.desiredHeight = height;
		this.desiredWidth = width;

		this.setWidth(width);
		this.setHeight(height);
	}
});
