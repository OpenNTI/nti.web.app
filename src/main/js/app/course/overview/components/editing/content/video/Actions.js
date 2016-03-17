export default Ext.define('NextThought.app.course.overview.components.editing.content.video.Actions', {
	extend: 'NextThought.app.course.overview.components.editing.Actions',

	requires: [
		'NextThought.model.VideoRoll',
		'NextThought.model.Video'
	],

	__getVideoRollData: function(videos) {
		var data = {
				MimeType: NextThought.model.VideoRoll.mimeType
			};

		data.Items = videos.map(function(video) {
			return video.getId();
		});

		return data;
	},


	__getVideoData: function(video) {
		return {
			MimeType: NextThought.model.Video.mimeType,
			NTIID: video.getId()
		};
	},


	__createVideoRollValue: function(videos, position) {
		var values = this.__getVideoRollData(videos);

		return this.__createRecordValues(values, position);
	},


	__createSingleVideo: function(video, position) {
		var values = this.__getVideoData(video);

		return this.__createRecordValues(values, position);
	},


	__createVideos: function(videos, position) {
		var create;

		//If there is more than one create a video roll, otherwise create a single video
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


	/**
	 * Remove a record from the oldPosition and add it to the new one
	 * @param  {Model} oldRecord   the record to remove
	 * @param  {Object} oldPosition the parent and position of the old position
	 * @param  {Object} newValues   the new values to update the record with
	 * @param  {Object} newPosition the parent and position of the new position
	 * @param  {Object} root        the moving root of both parents
	 * @return {Promise}            fulfills when both operations are done
	 */
	__removeAndAdd: function(oldRecord, oldPosition, newValues, newPosition, root) {
		var oldParent = oldPosition.parent,
			newParent = newPosition.parent,
			save;

		if (oldParent) {
			save = oldParent.removeRecord(oldRecord)
				.then(function() {
					if (newParent) {
						return newParent.insertContent(newValues, newPosition.index);
					}

					return Promise.reject({
						msg: 'Unable to add record to new location after removing it from the old',
						err: 'No new parent'
					});
				});
		} else {
			save = Promise.reject({
				msg: 'Unable to update record',
				err: 'No old parent to remove from'
			});
		}

		return save;
	},


	__convertRollToSingle: function(videos, record, originalPosition, newPosition, root) {
		var newVideo = this.__getVideoData(videos[0]);

		return this.__removeAndAdd(record, originalPosition, newVideo, newPosition, root);
	},


	__convertSingleToRoll: function(videos, record, originalPosition, newPosition, root) {
		var newVideos = this.__getVideoRollData(videos);

		return this.__removeAndAdd(record, originalPosition, newVideos, newPosition, root);
	},


	__updateVideoRoll: function(videos, record, originalPosition, newPosition, root) {
		if (videos.length === 1) {
			return this.__convertRollToSingle(videos, record, originalPosition, newPosition, root);
		}

		var link = record.getLink('edit'),
			values = {};

		if (!link) {
			return Promise.reject({
				msg: 'Unable to update record',
				err: 'No edit link'
			});
		}

		values.Items = videos.map(function(video) {
			return video.getId();
		});

		return Service.put(link, values)
			.then(function(response) {
				record.syncWithResponse(response);

				return record;
			})
			.then(this.__moveRecord.bind(this, record, originalPosition, newPosition, root));

	},


	__updateSingleVideo: function(videos, record, originalPosition, newPosition, root) {
		if (videos.length > 1) {
			return this.__convertSingleToRoll(videos, record, originalPosition, newPosition, root);
		}

		var newVideo = videos[0],
			newParent = newPosition.parent,
			oldParent = originalPosition.parent,
			samePosition = newParent === oldParent && originalPosition.index === newPosition.index,
			sameRecord = newVideo.getId() === record.getId(),
			save;

		//If we are the same record in the same position don't do anything
		if (samePosition && sameRecord) {
			save = Promise.resolve();
		//The move api is causing trouble with videos for now, so skip this optimization
		} else if (sameRecord && false) {
			if (newParent) {
				save = newParent.moveToFromContainer(record, newPosition.index, originalPosition.index, oldParent, root);
			} else {
				save = Promise.reject({
					msg: 'Unable to update record',
					err: 'No new parent'
				});
			}
		} else {
			newVideo = this.__getVideoData(newVideo);

			save = this.__removeAndAdd(record, originalPosition, newVideo, newPosition, root);
		}

		return save;
	},


	__updateVideos: function(videos, record, originalPosition, newPosition, root) {
		var save;

		if (!videos) {
			save = this.__moveRecord(record, originalPosition, newPosition, root);
		} else if (record instanceof NextThought.model.VideoRoll) {
			save = this.__updateVideoRoll(videos, record, originalPosition, newPosition, root);
		} else if (record instanceof NextThought.model.Video) {
			save = this.__updateSingleVideo(videos, record, originalPosition, newPosition, root);
		}

		return save;
	},


	saveVideo: function(videos, record, originalParent, newParent, root) {
		if (record) {
			return this.__updateVideos(videos, record, originalParent, newParent, root);
		}

		return this.__createVideos(videos, newParent);
	}

});
