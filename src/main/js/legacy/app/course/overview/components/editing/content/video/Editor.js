const Ext = require('@nti/extjs');

const PromptActions = require('legacy/app/prompt/Actions');
const Video = require('legacy/model/Video');
const VideoRoll = require('legacy/model/VideoRoll');

require('../Editor');
require('./ItemSelection');
require('./VideoEditor');

require('legacy/app/video/Picker');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.video.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-video',
	SWITCHED: 'switched-items',

	statics: {
		getHandledMimeTypes: function () {
			return [
				Video.mimeType,
				VideoRoll.mimeType
			];
		},

		getTypes: function () {
			return [
				{
					title: 'Video',
					advanced: false,
					category: 'Video',
					iconCls: 'video',
					description: '',
					editor: this
				}
			];
		},

		//TODO: override getEditorForRecord to check if the related work ref
		//is pointing to a doc
		getEditorForRecord: function (record) {
			return this;
		}
	},

	cls: 'content-editor video-editor',

	initComponent: function () {
		this.callParent(arguments);

		this.PromptActions = PromptActions.create();
	},

	showEditor: function () {
		if (this.record) {
			this.showVideoEditor();
		} else {
			this.showVideoList();
		}
	},

	maybeEnableBack: function (text) {
		if (!this.record && this.enableBack) {
			this.enableBack(text);
		}
	},

	onBack: function () {
		if (this.videoEditorCmp) {
			this.showVideoList(this.videoEditorCmp.selectedItems);
		} else if (this.doBack) {
			this.doBack();
		}
	},

	__sortVideos: function (videos) {
		return videos.sort(function (a, b) {
			var vA = a.get('title') || '',
				vB = b.get('title') || '';

			return vA.localeCompare(vB);
		});
	},

	__getExcludedVideos: function (videos) {
		var siblings = this.parentRecord ? this.parentRecord.get('Items') : [];

		return siblings.reduce(function getVideoIds (acc, item) {
			if (item instanceof Video) {
				acc.push(item.getId());
			} else if (item instanceof VideoRoll) {
				acc = item.get('Items').reduce(getVideoIds, acc);
			}

			return acc;
		}, []).reduce(function (acc, item) {
			acc.push({
				id: item,
				msg: 'Videos can not be in the same section more than once'
			});

			return acc;
		}, []);
	},

	showVideoList: function (selectedItems, onEdit) {
		var me = this,
			exclude = me.__getExcludedVideos();

		if (this.videoSelectionCmp) {
			this.videoSelectionCmp.destroy();
			delete this.videoSelectionCmp;
		}

		if (this.addVideoBtn) {
			this.addVideoBtn.destroy();
			delete this.addVideoBtn;
		}

		if (this.videoEditorCmp) {
			this.videoEditorCmp.destroy();
			delete this.videoEditorCmp;
		}

		me.removeAll(true);

		me.maybeEnableBack(this.backText);

		me.addVideoBtn = me.add({
			xtype: 'box',
			autoEl: {tag: 'div', cls: 'create-video-overview-editing', html: 'Add Video'},
			listeners: {
				click: {
					element: 'el',
					fn: me.pickVideo.bind(me)
				}
			}
		});

		me.videoSelectionCmp = me.add({
			xtype: 'overview-editing-video-item-selection',
			onSelectionChanged: this.onVideoListSelectionChange.bind(this),
			selectedItems: selectedItems,
			editItem: (...args) => this.pickVideo(...args, onEdit),
			getExcludedVideos: (...args) => this.__getExcludedVideos(...args),
			lockBodyHeight: this.lockBodyHeight
		});

		me.bundle.getVideoAssets()
			.then(me.__sortVideos.bind(me))
			.then(function (videos) {
				me.videoSelectionCmp.setSelectionItems(videos);
				me.videoSelectionCmp.excludeItems(exclude);
			});
	},


	pickVideo (ntiid, onEdit) {
		ntiid = ntiid instanceof Object ? null : ntiid;
		this.PromptActions.prompt('video-picker', {bundle: this.bundle, video: ntiid, onVideoDelete: this.onVideoDelete.bind(this)})
			.then((video) => {
				if (this.videoSelectionCmp) {
					if (!ntiid) {
						this.videoSelectionCmp.addSelectionItem(video, true);
					} else {
						this.videoSelectionCmp.updateSelectionItem(video);

						if (onEdit) {
							onEdit(video);
						}
					}
				}
			});
	},


	onVideoDelete (video) {
		const ntiid = video && video.getID ? video.getID() : video;

		this.videoSelectionCmp.deleteSelectionItem(ntiid);

		if (this.record instanceof Video) {
			this.parentRecord.updateFromServer();
			delete this.record;
		} else if (this.record instanceof VideoRoll) {
			this.record.updateFromServer();
		}
	},


	showVideoEditor: function () {
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
			showError: this.showError,
			bundle: this.bundle
		});

		if (this.addVideoBtn) {
			this.addVideoBtn.destroy();
			delete this.addVideoBtn;
		}

		if (this.videoSelectionCmp) {
			this.videoSelectionCmp.destroy();
			delete this.videoSelectionCmp;
		}

		this.enableSave();
		this.setSaveText(this.record ? 'Save' : 'Add to Lesson');
		this.maybeEnableBack('Videos');

		if (this.unlockBodyHeight) {
			this.unlockBodyHeight();
		}
	},

	onVideoListSelectionChange: function (selection) {
		var length = selection.length;

		if (length === 0) {
			this.disableSave();
			this.setSaveText('Select 0');
		} else {
			this.enableSave();
			this.setSaveText('Select ' + length);
		}
	},

	onSaveFailure: function (reason) {
		if (reason === this.SWITCHED) { return; }

		this.callParent(arguments);
	},

	doValidation: function () {
		return Promise.resolve();
	},

	onSave: function () {
		var me = this;

		if (!me.videoEditorCmp) {
			me.showVideoEditor();
			return Promise.reject(me.SWITCHED);
		}

		me.disableSubmission();
		return me.videoEditorCmp.onSave()
			.catch(function (reason) {
				me.enableSubmission();
				return Promise.reject(reason);
			});
	}
});
