const Ext = require('@nti/extjs');

const VideoActions = require('./Actions');

require('../Editor');
require('./items/Items');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.video.VideoEditor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-video-editor',
	layout: 'none',
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		this.VideoEditingActions = VideoActions.create();
	},

	showEditor: function () {
		this.parentSelection = this.addParentSelection(this.record, this.parentRecord, this.rootRecord);

		this.videoItems = this.add({
			xtype: 'overview-editing-video-items',
			selectedItems: this.selectedItems,
			record: this.record,
			onAddVideos: this.onAddVideos
		});

		if (this.record) {
			this.addDeleteButton();
		}
	},

	onSave: function () {
		var parentSelection = this.parentSelection,
			originalPosition = parentSelection && parentSelection.getOriginalPosition(),
			currentPosition = parentSelection && parentSelection.getCurrentPosition(),
			values = this.videoItems && this.videoItems.getItems();

		return this.VideoEditingActions.saveVideo(values, this.record, originalPosition, currentPosition, this.rootRecord)
			.then((video) => {
				this.bundle.reloadVideoIndex();

				return video;
			});
	}
});
