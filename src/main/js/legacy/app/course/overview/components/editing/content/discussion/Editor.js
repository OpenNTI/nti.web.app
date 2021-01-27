const Ext = require('@nti/extjs');
const {Community} = require('@nti/web-profiles');
const {isFlag} = require('@nti/web-client');
const {Forums} = require('@nti/web-discussions');

const DiscussionRef = require('legacy/model/DiscussionRef');
const Discussion = require('legacy/model/Discussion');
const CommunityHeadlineTopic = require('legacy/model/forums/CommunityHeadlineTopic');

require('../Editor');
require('./ItemSelection');
require('./DiscussionEditor');

const Types = [
	'application/vnd.nextthought.forums.topic',
	'application/vnd.nextthought.forums.headlinetopic',
	'application/vnd.nextthought.forums.communityheadlinetopic'
];

function unwrapSelection (topic) {
	if(!topic || topic.get?.('ID')) {
		return topic;
	}


	const record = new CommunityHeadlineTopic(topic.toJSON?.() ?? topic);

	// need to alter the record a bit just to fit what the generic
	// Editor expects (for example, Editor relies on the 'edit' link
	// to determine Delete button presence.  new records shouldn't
	// have that)
	record.set('ID', record.getId());
	record.hasLink = (prop) => false;
	record.getLink = (prop) => null;

	return record;
}

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.discussion.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-discussion',

	statics: {
		getHandledMimeTypes: function () {
			return [
				DiscussionRef.mimeType,
				Discussion.mimeType
			];
		},

		getTypes: function () {
			return [
				{
					title: 'Discussion',
					advanced: false,
					category: 'Discussion',
					iconCls: 'discussion',
					description: '',
					editor: this,
					isAvailable: async (bundle) => {
						const available = await bundle.getAvailableContentSummary();

						return Types.some(t => available[t]);
					}
				}
			];
		}
	},

	SWITCHED: 'switched-items',


	addFormCmp: function () {},

	onDiscussionTopicSelect (selectedTopics) {
		this.record = unwrapSelection(...selectedTopics);
		if (this.record) {
			this.enableSave();
		} else {
			this.disableSave();
		}
	},


	beforeDestroy () {
		if (this.selectionCmp) {
			this.selectionCmp.destroy();
		}
	},


	showEditor: async function () {
		if (this.record) {
			this.showDiscussionEditor();
		} else {
			const {bundle} = this;
			const complex = async () => (await bundle.fetchLink('CourseDiscussions').catch(() => {})).Total > 0;
			const onSelect = (selectedTopics) => this.onDiscussionTopicSelect(selectedTopics);

			this.selectionCmp = this.add({
				xtype: 'react',
				...(!isFlag('channel-picker') || await complex() ? {
					bundle,
					component: Forums.DiscussionSelectionEditor,
					onDiscussionTopicSelect: onSelect,
				} : {
					component: Community.DiscussionPicker,
					course: await bundle.getInterfaceInstance(),
					onSelect
				})
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
