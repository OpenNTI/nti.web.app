Ext.define('NextThought.app.course.overview.components.editing.content.video.Actions', {
	extend: 'NextThought.app.course.overview.components.editing.Actions',

	requires: [
		'NextThought.model.VideoRoll',
		'NextThought.model.Video'
	],


	__createVideoRollValue: function(videos, position) {
		var values = {
				MimeType: NextThought.model.VideoRoll.mimeType,
				Items: []
			};

		values.Items = videos.map(function(video) {
			return video.getId();
		});

		return this.__createRecordValues(values, position);
	},


	__createSingleVideo: function(video, position) {
		var values = {
				MimeType: NextThought.model.Video.mimeType,
				NTIID: video.getId()
			};

		return this.__createRecordValues(values, position);
	},


	__createVideos: function(videos, position) {
		var create;

		if (Array.isArray(videos)) {
			if (videos.length > 1) {
				create = this.__createVideoRollValue(videos, position);
			} else {
				create = this.__createSingleVideo(videos[0], position);
			}
		} else {
			create = this.__createSingleVideo(videos[0], position);
		}

		return create;
	},


	__updateVideos: function(videos, record, originalPosition, newPosition, root) {
		//TODO: fill this out
	},


	saveVideo: function(videos, record, originalParent, newParent, root) {
		if (record) {
			return this.__updateVideos(videos, record, originalParent, newParent, root);
		}

		return this.__createVideos(videos, newParent);
	}

});
