Ext.define('NextThought.app.course.overview.components.editing.content.timeline.TimelineEditor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-timeline-editor',
	
	cls: 'content-editor content-link',
	
	requires: [
		'NextThought.model.TimelineRef'
	],
	
	
	getFormSchema: function() {
		var schema = [
				{name: 'MimeType', type: 'hidden'},
				{name: 'ntiid', type: 'hidden'},
				{type: 'group', name: 'card', inputs: [
					{
						name: 'icon',
						type: 'image',
						height: 125,
						width: 100,
						keep: true,
						placeholder: NextThought.model.TimelineRef.defaultIcon
					},
					{
						type: 'group',
						name: 'meta',
						inputs: [
							{
								name: 'label',
								type: 'text',
								placeholder: 'Title',
								required: true,
								keep: true,
								maxlength: NextThought.app.course.overview.components.editing.Actions.MAX_TITLE_LENGTH
							}
						]
					},
					{type: 'saveprogress'}
				]}
			];

		return schema;
	},


	getDefaultValues: function() {
		if (this.record) {
			var data = this.record.isModel && this.record.getData();

			data = Ext.apply(data, {
				'icon': this.getThumbnailURL(),
				'ntiid': this.record.get('ID') || this.record.getId(),
				MimeType: NextThought.model.Timeline.mimeType
			});

			return data;
		}

		return {
			MimeType: NextThought.model.TimelineRef.mimeType
		};
	},
	
	
	isTimelineRef: function(record) {
		if (record && record.get('MimeType') === NextThought.model.TimelineRef.mimeType) {
			return true;
		}

		return false;
	},


	getFormMethod: function() {
		var isRef = this.isTimelineRef(this.record);
		if (isRef) {
			return 'PUT';
		}

		return 'POST';
	},

	getThumbnailURL: function() {
		var iconURL = this.record && this.record.get('icon');
		if (iconURL) {
			if (Globals.ROOT_URL_PATTERN.test(iconURL)) {
				return getURL(iconURL);
			}

			iconURL = (this.basePath || '') + iconURL;
			return getURL(iconURL);
		}

		return '';
	},
	
	
	onSave: function() {
		var me = this,
			parentSelection = me.parentSelection,
			originalPosition = parentSelection && parentSelection.getOriginalPosition(),
			currentPosition = parentSelection && parentSelection.getCurrentPosition(),
			isRef = this.isTimelineRef(this.record),
			rec = isRef ? this.record : null;

		me.clearErrors();
		me.disableSubmission();

		return me.EditingActions.saveEditorForm(me.formCmp, rec, originalPosition, currentPosition, me.rootRecord)
			.then(function(rec) {

			})
			.fail(function(reason) {
				me.enableSubmission();

				return Promise.reject(reason);
			});
	}
});
