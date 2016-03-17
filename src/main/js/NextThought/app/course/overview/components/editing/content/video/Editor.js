Ext.define('NextThought.app.course.overview.components.editing.content.video.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-video',

	requires: [
		'NextThought.model.Video',
		'NextThought.model.VideoRoll',
		'NextThought.app.course.overview.components.editing.content.video.ItemSelection',
		'NextThought.app.course.overview.components.editing.content.video.VideoEditor'
	],


	SWITCHED: 'switched-items',


	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.Video.mimeType,
				NextThought.model.VideoRoll.mimeType
			];
		},

		getTypes: function() {
			return [
				{
					title: 'Pick a Video',
					advanced: true,
					category: 'Video',
					iconCls: 'video',
					description: '',
					editor: this
				}
			];
		},

		//TODO: override getEditorForRecord to check if the related work ref
		//is pointing to a doc
		getEditorForRecord: function(record) {
			return this;
		}
	},

	cls: 'content-editor video-editor',

	initComponent: function() {
		this.callParent(arguments);
	},


	showEditor: function() {
		if (this.record) {
			this.showVideoEditor();
		} else {
			this.showVideoList();
		}
	},


	maybeEnableBack: function(text) {
		if (!this.record && this.enableBack) {
			this.enableBack(text);
		}
	},


	onBack: function() {
		if (this.videoEditorCmp) {
			this.showVideoList(this.videoEditorCmp.selectedItems);
		} else if (this.doBack) {
			this.doBack();
		}
	},


	__sortVideos: function(videos) {
		return videos.sort(function(a, b) {
			var vA = a.get('title'),
				vB = b.get('title');

			return vA.localeCompare(vB);
		});
	},


	__getExcludedVideos: function(videos) {
		var siblings = this.parentRecord ? this.parentRecord.get('Items') : [];

		return siblings.reduce(function getVideoIds(acc, item) {
				if (item instanceof NextThought.model.Video) {
					acc.push(item.getId());
				} else if (item instanceof NextThought.model.VideoRoll) {
					acc = item.get('Items').reduce(getVideoIds, acc);
				}

				return acc;
			}, []).reduce(function(acc, item) {
				acc.push({
					id: item,
					msg: 'Videos can not be in the same section more than once'
				});

				return acc;
			}, []);
	},


	showVideoList: function(selectedItems) {
		var me = this,
			exclude = me.__getExcludedVideos();

		if (this.videoSelectionCmp) {
			this.videoSelectionCmp.destroy();
			delete this.videoSelectionCmp;
		}

		if (this.videoEditorCmp) {
			this.videoEditorCmp.destroy();
			delete this.videoEditorCmp;
		}

		me.removeAll(true);

		me.maybeEnableBack(this.backText);

		me.videoSelectionCmp = me.add({
			xtype: 'overview-editing-video-item-selection',
			onSelectionChanged: this.onVideoListSelectionChange.bind(this),
			selectedItems: selectedItems
		});

		me.bundle.getVideoAssets()
			.then(me.__sortVideos.bind(me))
			.then(function(videos) {
				me.videoSelectionCmp.setSelectionItems(videos);
				me.videoSelectionCmp.excludeItems(exclude);
			});
	},


	showVideoEditor: function() {
		if (this.videoEditorCmp) {
			this.viedoEditorCmp.destroy();
			delete this.videoEditorCmp;
		}

		this.videoEditorCmp = this.add({
			xtype: 'overview-editing-video-editor',
			record: this.record,
			parentRecord: this.parentRecord,
			rootRecord: this.rootRecord,
			selectedItems: this.videoSelectionCmp && this.videoSelectionCmp.getSelection(),
			onAddVideos: this.showVideoList.bind(this),
			doClose: this.doClose,
			showError: this.showError
		});

		if (this.videoSelectionCmp) {
			this.videoSelectionCmp.destroy();
			delete this.videoSelectionCmp;
		}

		this.enableSave();
		this.setSaveText(this.record ? 'Save' : 'Add to Lesson');
		this.maybeEnableBack('Videos');
	},


	onVideoListSelectionChange: function(selection) {
		var length = selection.length;

		if (length === 0) {
			this.disableSave();
			this.setSaveText('Select 0');
		} else {
			this.enableSave();
			this.setSaveText('Select ' + length);
		}
	},


	onSaveFailure: function(reason) {
		if (reason === this.SWITCHED) { return; }

		this.callParent(arguments);
	},


	doValidation: function() {
		return Promise.resolve();
	},


	onSave: function() {
		var me = this;

		if (!me.videoEditorCmp) {
			me.showVideoEditor();
			return Promise.reject(me.SWITCHED);
		}

		me.disableSubmission();
		return me.videoEditorCmp.onSave()
			.fail(function(reason) {
				me.enableSubmission();
				return Promise.reject(reason);
			});
	}
});
