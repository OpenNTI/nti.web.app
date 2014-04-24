Ext.define('NextThought.view.courseware.info.parts.Title', {
	extend: 'Ext.Component',
	alias: 'widget.course-info-title',

	ui: 'course-info',
	cls: 'title-box',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'video'},
		{cls: 'curtain'},
		{cls: 'title', html: '{title}'}
	]),

	renderSelectors: {
		videoEl: '.video',
		curtainEl: '.curtain'
	},

	listeners: {
		curtainEl: {
			click: 'curtainClicked'
		}
	},

	beforeRender: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.title
		});
	},


	afterRender: function() {
		var me = this;
		this.callParent(arguments);

		this.buildVideo();
	},


	buildVideo: function() {
		Ext.destroy(this.video, this.videoMonitor);

		if (!Ext.isEmpty(this.videoUrl)) {
			this.video = Ext.widget({
				xtype: 'content-video',
				url: this.videoUrl,
				width: 764,
				playerWidth: 764,//video initializes early enough it can't read the dom just yet...so lets JUST GET IT DONE...
				renderTo: this.videoEl,
				floatParent: this
			});
			this.video.mon(this, 'destroy', 'destroy', this.video);

			this.videoMonitor = this.mon(this.video, {
				destroyable: true,
				'beforeRender': {
					fn: function() {
						me.addCls('has-video');
					},
					single: true
				},
				'player-event-ended': {
					fn: 'showCurtain',
					scope: this,
					buffer: 1000
				}
			});
		}
	},


	showCurtain: function() {
		this.removeCls('playing');
		this.buildVideo();
	},


	curtainClicked: function(e) {
		if (e && e.shiftKey && this.player.canOpenExternally()) {
			this.video.openExternally();
		}
		else {
			this.addCls('playing');
			this.video.resumePlayback();
		}
	}
});
