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

		if (!Ext.isEmpty(this.videoUrl)) {
			this.video = Ext.widget({
				xtype: 'content-video',
				url: this.videoUrl,
				width: 764,
				playerWidth: 764,//video initializes early enough it can't read the dom just yet...so lets JUST GET IT DONE...
				renderTo: this.videoEl,
				floatParent: this
			});
			this.mon(this.video, {
				'beforeRender': {
					fn: function() {
						me.addCls('has-video');
					},
					single: true
				}
			});
			this.on('destroy', 'destroy', this.video);
		}
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
