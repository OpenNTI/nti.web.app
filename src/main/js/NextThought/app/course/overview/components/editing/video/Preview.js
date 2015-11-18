Ext.define('NextThought.app.course.overview.components.editing.video.Preview', {
	extend: 'Ext.Component',
	alias: 'widget.editing-video-preview',

	// ui: 'content-card',
	cls: 'curtain transcripts preview',

	// TODO: Make it look like a video
	// renderTpl: Ext.DomHelper.markup(
	// 	{ cls: 'body', cn: [
	// 		{ cls: 'video-container', cn: [
	// 			{ cls: 'screen' }
	// 		]},
	// 		{ cls: 'curtain', cn: [
	// 			{ cls: 'ctr', cn: [
	// 				{ cls: 'play', cn: [
	// 					{cls: 'blur-clip', cn: {cls: 'blur'}},
	// 					{ cls: 'label', 'data-qtip': '{{{NextThought.view.courseware.overview.parts.Videos.playtranscript}}}'},
	// 					{cls: 'launch-player', 'data-qtip': '{{{NextThought.view.courseware.overview.parts.Videos.play}}}'}
	// 				] }
	// 			] }
	// 		]},
	// 		{ cls: 'video-list'}
	// 	]}
	// ),

	beforeRender: function () {
		this.callParent(arguments);
		// TODO: Get the video title and poster
		// this.renderData = Ext.apply(this.renderData || {}, this.data);
	}
});
