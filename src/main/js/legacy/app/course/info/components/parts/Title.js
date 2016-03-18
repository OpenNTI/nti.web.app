var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.course.info.components.parts.Title', {
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


	beforeRender: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.title
		});
	},


	afterRender: function() {
		this.callParent(arguments);
		this.buildVideo();
		if (!Ext.isEmpty(this.videoUrl)) {
			this.videoEl.setStyle({
				minHeight: this.videoHeight ? this.videoHeight + 'px' : '430px'
			});

			this.mon(this.curtainEl, 'click', 'curtainClicked', this);
		} else {
			this.curtainEl.remove();
			this.videoEl.remove();
		}
	},


	buildVideo: function() {
		Ext.destroy(this.video, this.videoMonitor);

		if (!Ext.isEmpty(this.videoUrl)) {
			this.video = Ext.widget({
				xtype: 'content-video',
				url: this.videoUrl,
				width: this.videoWidth,
				playerWidth: this.videoWidth,//video initializes early enough it can't read the dom just yet...so lets JUST GET IT DONE...
				renderTo: this.videoEl,
				floatParent: this,
				doNotCaptureAnalytics: true
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
		Ext.destroy(this.video, this.videoMonitor);
		delete this.video;
		delete this.videoMonitor;
	},


	curtainClicked: function(e) {
		var p = Promise.resolve();

		if (!this.video) {
			this.buildVideo();
			p = wait();
		}

		p.then(function() {
			if (e && e.shiftKey && this.player.canOpenExternally()) {
				this.video.openExternally();
			}
			else {
				this.addCls('playing');
				this.video.resumePlayback();
			}
		}.bind(this));
	}
});
