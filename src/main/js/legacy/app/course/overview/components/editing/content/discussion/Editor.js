const Ext = require('extjs');
const {Forums} = require('nti-web-discussions');

require('../Editor');
require('../../../../../../../model/DiscussionRef');
const CommunityHeadlineTopic = require('../../../../../../../model/forums/CommunityHeadlineTopic');
require('./ItemSelection');
require('./DiscussionEditor');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.discussion.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-discussion',

	statics: {
		getHandledMimeTypes: function () {
			return [
				NextThought.model.DiscussionRef.mimeType,
				NextThought.model.Discussion.mimeType
			];
		},

		getTypes: function () {
			return [
				{
					title: 'Pick a Discussion',
					advanced: false,
					category: 'Discussion',
					iconCls: 'discussion',
					description: '',
					editor: this
				}
			];
		}
	},

	SWITCHED: 'switched-items',


	addFormCmp: function () {},

	onDiscussionTopicSelect: function (selectedTopics) {
		var length = selectedTopics.length;

		if (length === 0) {
			this.disableSave();
		} else {
			if(selectedTopics[0].get && selectedTopics[0].get('ID')) {
				this.record = selectedTopics[0];
			}
			else {
				this.record = new CommunityHeadlineTopic(selectedTopics[0]);

				// need to alter the record a bit just to fit what the generic
				// Editor expects (for example, Editor relies on the 'edit' link
				// to determine Delete button presence.  new records shouldn't
				// have that)
				this.record.set('ID', this.record.getId());
				this.record.hasLink = (prop) => false;
				this.record.getLink = (prop) => null;
			}

			this.enableSave();
		}
	},

	showEditor: function () {
		if (this.record) {
			this.showDiscussionEditor();
		} else {
			const me = this;

			this.selectionCmp = this.add({
				xtype: 'react',
				component: Forums.DiscussionSelectionEditor,
				bundle: this.bundle,
				onDiscussionTopicSelect: (selectedTopics) => { me.onDiscussionTopicSelect(selectedTopics); }
			});
		}
	},

	maybeEnableBack: function (text) {
		if (!this.record && this.enableBack) {
			this.enableBack(text);
		}
	},


	showDiscussionEditor: function () {
		if (this.discussionEditorCmp) {
			this.discussionEditorCmp.destroy();
			delete this.discussionEditorCmp;
		}

		this.removeAll(true);

		this.discussionEditorCmp = this.add({
			xtype: 'overview-editing-discussion-editor',
			parentRecord: this.parentRecord,
			record: this.record,
			rootRecord: this.rootRecord,
			doClose: this.doClose,
			showError: this.showError,
			basePath: this.bundle && this.bundle.getContentRoots()[0],
			enableSave: this.enableSave,
			disableSave: this.disableSave
		});

		this.maybeEnableBack('Discussions');
	},


	doValidation () {
		return this.discussionEditorCmp ? this.discussionEditorCmp.doValidation() : Promise.resolve();
	},


	onSave: function () {
		var me = this;
		if (!me.discussionEditorCmp) {
			me.showDiscussionEditor();
			return Promise.reject(me.SWITCHED);
		}

		me.disableSubmission();
		return me.discussionEditorCmp.onSave()
			.catch(function (reason) {
				me.enableSubmission();
				return Promise.reject(reason);
			});
	},


	onSaveFailure: function (reason) {
		if (reason === this.SWITCHED) { return; }

		this.callParent(arguments);
	}
});
