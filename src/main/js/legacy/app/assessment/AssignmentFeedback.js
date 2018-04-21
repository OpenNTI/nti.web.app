const Ext = require('@nti/extjs');

const {isMe} = require('legacy/util/Globals');
const {getString} = require('legacy/util/Localization');
const FilePicker = require('legacy/common/form/fields/FilePicker');
const UsersCourseAssignmentHistoryItemFeedback = require('legacy/model/courseware/UsersCourseAssignmentHistoryItemFeedback');

require('legacy/common/form/fields/FilePicker');
require('legacy/editor/Editor');
require('legacy/app/contentviewer/overlay/Panel');
require('./components/feedback/List');


module.exports = exports = Ext.define('NextThought.app.assessment.AssignmentFeedback', {
	extend: 'NextThought.app.contentviewer.overlay.Panel',
	alias: 'widget.assignment-feedback',
	cls: 'feedback-panel',
	ui: 'assessment',
	appendPlaceholder: true,
	forceInsert: true,
	hidden: true,
	shouldShow: true,

	items: [
		{
			xtype: 'box',
			ui: 'feedback-title',
			name: 'title',
			autoEl: { cn: [
				{ tag: 'h1', html: 'Feedback' },
				{ cls: 'message' }
			]},
			renderSelectors: {
				messageEl: '.message'
			}
		},
		{
			xtype: 'assignment-feedback-list'
		},
		{
			xtype: 'box',
			ui: 'comment-box',
			name: 'comment',
			autoEl: { cn: [
				{cls: 'editor-box'}
			]},
			renderSelectors: {
				feedbackBox: '.editor-box'
			}
		}
	],

	afterRender: function () {
		this.callParent(arguments);

		var commentBox;

		this.feedbackList = this.down('assignment-feedback-list');
		this.feedbackList.syncElementHeight = this.syncElementHeight.bind(this);
		this.feedbackList.openReply = this.showEditor.bind(this);

		this.comment = this.down('box[name=comment]');

		commentBox = this.comment.feedbackBox;

		if (this.history) {
			this.mon(this.history, {
				'force-submission': this.onForceSubmission.bind(this),
				'was-destroyed': this.onHistoryDestroyed.bind(this)
			});

			this.setHistory(this.history);
		}

		this.fireEvent('has-been-submitted', this);

		this.mon(commentBox, {
			'click': 'showEditor'
		});

		this.editor = Ext.widget('nti-editor', {
			ownerCt: this,
			renderTo: this.comment.feedbackBox,
			enableObjectControls: true, //lets not open too much complexity yet.
			enableFileUpload: true
		});

		this.mon(this.editor, {
			'activated-editor': function () {
				commentBox.addCls('editor-active');
			},
			'deactivated-editor': function () {
				commentBox.removeCls('editor-active');
			},
			'save': 'addFeedback',
			'no-body-content': function (editor, el) {
				editor.markError(el, getString('NextThought.view.assessment.AssignmentFeedback.empty-editor'));
				return false;
			}
		});
	},

	addFeedback: function (editor) {
		var item = new UsersCourseAssignmentHistoryItemFeedback({body: editor.getValue().body}),
			me = this,
			feedback = this.history.get('Feedback'),
			store = this.store;

		editor.el.mask('Saving...');
		item.saveData({url: feedback.get('href')})
			.then(function (response) {
				console.log('Saved feedback:', response);
				editor.el.unmask();
				editor.deactivate();
				editor.setValue('');
				me.addMask();
				store.load();
				me.removeMask();
			})
			.catch(function (err) {
				editor.el.unmask();
				console.error('faild to save feedback', err);
				if (err && err.responseText) {
					err = JSON.parse(err.responseText);
				}

				if (err.code === 'MaxFileSizeUploadLimitError') {
					let maxSize = FilePicker.getHumanReadableFileSize(err.max_bytes),
						currentSize = FilePicker.getHumanReadableFileSize(err.provided_bytes);
					err.message += ' Max File Size: ' + maxSize + '. Your uploaded file size: ' + currentSize;
				}
				if (err.code === 'MaxAttachmentsExceeded') {
					err.message += ' Max Number of files: ' + err.constraint;
				}

				let msg = err && err.message || 'Could not save feedback';
				alert({title: 'Attention', msg: msg, icon: 'warning-red'});
				me.removeMask();
			});
	},


	onForceSubmission () {
		this.setHistory(this.history);
	},


	onHistoryDestroyed () {
		this.setHistory(this.history);
	},


	setHistory: function (history) {
		if (!history || !history.get('Feedback')) {
			this.hide();
			return;
		}

		this.history = history;

		var s = getString('NextThought.view.assessment.AssignmentFeedback.visibility-message') + ' {0}.',
			header = this.down('box[name=title]'),
			feedback = history.get('Feedback').get('href');

		this.store = new Ext.data.Store({
			model: UsersCourseAssignmentHistoryItemFeedback,
			proxy: {
				type: 'rest',
				url: feedback,
				reader: {
					type: 'json',
					root: 'Items'
				}
			},
			sorters: [
				{ property: 'CreatedTime' }
			]
		});

		if (this.history.fields.get('feedback')) {
			this.mon(this.store, 'load', 'updateFeedback');
		}

		this.feedbackList.bindStore(this.store);
		this.store.load();

		header.messageEl.update(
			Ext.String.format(
				s,
				(isMe(history.get('Creator')) ?
					getString('NextThought.view.assessment.AssignmentFeedback.visibility-instr') :
					getString('NextThought.view.assessment.AssignmentFeedback.visibility-student')
				)
			)
		);

		this.show();
	},

	showEditor: function () {
		this.editor.activate();
		Ext.defer(this.editor.focus, 350, this.editor);
		this.updateLayout();

		return this.editor;
	},

	updateFeedback: function (store) {
		var items = store.getRange();

		this.history.get('Feedback').set({
			Items: items
		});

		this.history.afterEdit(['feedback']);
	},


	addMask: function () {
		if(this.feedbackList) {
			this.feedbackList.el.mask('Loading...');
		}
	},

	removeMask: function () {
		if(this.feedbackList) {
			this.feedbackList.el.unmask();
		}
	},

	getHeight: function () {
		let items = this.items && this.items.items || [],
			height = 0;

		items.forEach(function (element) {
			height += element.getHeight ? element.getHeight() : 0;
		}, this);

		return height;
	}
});
