const Ext = require('@nti/extjs');

require('legacy/app/video/Video');
require('legacy/model/PlaylistItem');
require('./VideoRollItem');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.parts.VideoRoll', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview-videoroll',
	ui: 'course',
	cls: 'overview-videos video-roll scrollable',

	// preserveScrollOnRefresh: true,

	layout: 'none',

	renderTpl: Ext.DomHelper.markup({
		cls: 'body',
		id: '{id}-body',
		cn: ['{%this.renderContainer(out,values)%}']
	}),

	getTargetEl: function () {
		return this.body;
	},

	childEls: ['body'],

	initComponent: function () {
		this.callParent(arguments);

		this.videoContainer = this.add({
			cls: 'video-container',
			xtype: 'container',
			layout: 'none',
			items: []
		});

		this.videoList = this.add({
			cls: 'video-list',
			xtype: 'container',
			layout: 'none',
			items: []
		});
	},

	constructor: function () {
		this.callParent(arguments);
		this.videoRoll = this.record;

		this.locationInfo = this.locationInfo;

		this.createVideoList();
		var firstVideo = this.videoRoll.getItems()[0];

		if (firstVideo) {
			this.selectVideo(firstVideo);
		}
	},

	createVideoList: function () {
		var videoRollItems = this.videoRoll && this.videoRoll.getItems(),
			selectVideo = this.selectVideo.bind(this),
			inEditMode = this.inEditMode,
			courseInstance = this.course;

		this.videoList.add(videoRollItems.map(function (videoRollItem) {
			return {
				xtype: 'course-overview-videoroll-item',
				video: videoRollItem,
				selectVideo: selectVideo,
				inEditMode,
				courseInstance
			};
		}));
	},

	selectVideo: function (video) {
		var videoListItems = this.videoList.items.items;

		videoListItems.forEach(function (item, index) {
			if(item.hasCls('selected')) {
				item.removeCls('selected');
			}else if(video.getId() === item.video.getId()) {
				item.addCls('selected');
			}
		});

		if(this.progress) {
			this.setProgress(this.progress);
		}

		this.setVideo(video);
	},

	setVideo: function (video) {
		this.videoContainer.removeAll(true);
		this.videoContainer.add({
			xtype: 'course-overview-video',
			record: video,
			course: this.course,
			locationInfo: this.locationInfo,
			navigate: this.navigate,
			isVideoRoll: true,
			setProgress: this.setProgress.bind(this)
		});
	},

	setProgress: function (progress) {
		progress = progress || this.progress;

		this.progress = progress;

		if (!progress) { return; }

		var videoListItems = this.videoList.items.items;

		videoListItems.forEach(function (item) {
			if(item.setProgress) {
				item.setProgress(progress);
			}
		});
	}
});
