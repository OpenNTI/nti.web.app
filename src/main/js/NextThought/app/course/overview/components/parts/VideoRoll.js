Ext.define('NextThought.app.course.overview.components.parts.VideoRoll', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview-videoroll',

	ui: 'course',
	cls: 'overview-videos video-roll scrollable',
	// preserveScrollOnRefresh: true,


	statics: {
		buildConfig: function(item) {
			return {
				xtype: this.xtype,
				videoRoll: item,
				course: item.course,
				navigate: item.navigate
			};
		}
	},

	layout: 'none',

	requires: [
		'NextThought.app.video.Video',
		'NextThought.app.course.overview.components.parts.VideoRollItem',
		'NextThought.model.PlaylistItem',
		'Ext.data.reader.Json',
		'NextThought.app.library.Actions'
	],

	renderTpl: Ext.DomHelper.markup({
		cls: 'body',
		id: '{id}-body',
		cn: ['{%this.renderContainer(out,values)%}']
	}),

	getTargetEl: function() {
		return this.body;
	},

	childEls: ['body'],

	initComponent: function(){
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

	constructor: function(config) {
		this.callParent([config]);

		this.createVideoList();
		this.selectVideo(this.videoRoll.Items[0]);
	},

	createVideoList: function() {
		var videoRollItems = this.videoRoll && this.videoRoll.Items,
			selectVideo = this.selectVideo.bind(this);

		this.videoList.add(videoRollItems.map(function(videoRollItem) {
			return {
				xtype: 'course-overview-videoroll-item',
				video: videoRollItem,
				selectVideo: selectVideo
			};
		}));
	},

	selectVideo: function(video) {
		var videoListItems = this.videoList.items.items;

		videoListItems.forEach(function(item, index){
			if(item.hasCls('selected')){
				item.removeCls('selected');
			}else if(video.ntiid === item.video.ntiid){
				item.addCls('selected');
			}
		});

		this.setVideo(video);
	},

	setVideo: function(video){
		this.videoContainer.removeAll(true);
		this.videoContainer.add({
			xtype: 'course-overview-video',
			record: video,
			isVideoRoll: true
		});
	}
});
