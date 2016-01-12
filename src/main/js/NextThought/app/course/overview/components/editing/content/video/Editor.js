Ext.define('NextThought.app.course.overview.components.editing.content.video.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-video',

	requires: [
		'NextThought.model.Video',
		'NextThought.app.course.overview.components.editing.content.video.ItemSelection',
		'NextThought.app.course.overview.components.editing.content.video.VideoEditor'
	],


	SWITCHED: 'switched-items',


	statics: {
		getHandledMimeTypes: function() {
			return [
				NextThought.model.Video.mimeType
			];
		},

		getTypes: function() {
			return [
				{
					title: 'Pick a Video',
					category: 'Video',
					iconCls: 'Video',
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
			//TODO: jump to the record editor
		} else {
			this.showVideoList();
		}
	},


	__flattenVideos: function(videos) {
		var keys = Object.keys(videos);

		return keys.reduce(function(acc, key) {
			var video = videos[key];

			return acc.concat(video);
		}, []).sort(function(a, b) {
			var vA = a.get('title'),
				vB = b.get('title');

			return vA.localeCompare(vB);
		});
	},


	showVideoList: function(selectedItems) {
		var me = this;

		if (this.videoSelectionCmp) {
			this.videoSelectionCmp.destroy();
			delete this.videoSelectionCmp;
		}

		if (this.videoEditorCmp) {
			this.videoEditorCmp.destroy();
			delete this.videoEditorCmp;
		}

		me.removeAll(true);

		me.videoSelectionCmp = me.add({
			xtype: 'overview-editing-video-item-selection',
			onSelectionChanged: this.onVideoListSelectionChange.bind(this),
			selectedItems: selectedItems
		});

		me.bundle.getVideosByContentPackage()
			.then(me.__flattenVideos.bind(me))
			.then(function(videos) {
				me.videoSelectionCmp.setSelectionItems(videos);
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
			onAddVideos: this.showVideoList.bind(this)
		});

		if (this.videoSelectionCmp) {
			this.videoSelectionCmp.destroy();
			delete this.videoSelectionCmp;
		}
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
		if (!this.videoEditorCmp) {
			this.showVideoEditor();
			return Promise.reject(this.SWITCHED);
		}


		return this.videoEditorCmp.onSave();
	}
});
