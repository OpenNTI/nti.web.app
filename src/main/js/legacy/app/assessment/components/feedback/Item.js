const Ext = require('extjs');

const {getString} = require('legacy/util/Localization');
const ContentviewerActions = require('legacy/app/contentviewer/Actions');
const FilePicker = require('legacy/common/form/fields/FilePicker');

require('legacy/app/whiteboard/Window');
require('legacy/mixins/ProfileLinks');

module.exports = exports = Ext.define('NextThought.app.assessment.components.feedback.Item', {
	extend: 'Ext.Component',
	alias: 'widget.assignment-feedback-item',
	cls: 'feedback-item',

	mixins: {
		profileLinks: 'NextThought.mixins.ProfileLinks'
	},

	renderTpl: Ext.DomHelper.markup([
		'{Creator:avatar}',
		{ cls: 'wrap', cn: [
			{ cls: 'meta', cn: [
				{ tag: 'span', cls: 'name', html: '{Creator}'},
				{ tag: 'time', datetime: '{CreatedTime:date("c")}', html: '{CreatedTime:ago()}'}
			]},
			{ cls: 'message', html: '{body}'},
			{tag: 'tpl', 'if': 'isMine', cn: { cls: 'footer', cn: [
				{ tag: 'span', cls: 'link edit', html: '{{{NextThought.view.assessment.AssignmentFeedback.edit}}}'},
				{ tag: 'span', cls: 'link delete', html: '{{{NextThought.view.assessment.AssignmentFeedback.delete}}}'}
			]}}
		]}
	]),


	renderSelectors: {
		messageEl: '.message'
	},


	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, this.record && this.record.getData() || {});
	},

	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.el, 'click', 'onFeedbackClick');
		this.update();
	},


	update: function () {
		let me = this;

		this.getBody()
			.then(function (html) {
				me.messageEl.setHTML(html);
				if (me.syncElementHeight) {
					me.syncElementHeight();
				}
			});
	},


	getBody: function () {
		if (!this.record) {
			return Promise.reject();
		}

		let r = this.record;

		this.wbData = {};

		return new Promise((fulfill) => {
			r.compileBodyContent(fulfill, this, (id, data, type) => {
				if (type === 'video') {
					console.error('Videos are not supported in feedback');
				} else {
					this.wbData[id] = data;
				}
			});
		});
	},


	openEditorFor: function (record, el) {
		var me = this,
			editorBox = this.el.down('.wrap');

		if (this.editor) {
			this.editor.editBody(this.record.get('body'));
			this.editor.activate();
			Ext.defer(this.editor.focus, 350, this.editor);
			this.updateLayout();
			return;
		}

		this.editor = Ext.widget('nti-editor', {
			ownerCt: this,
			renderTo: editorBox,
			record: record,
			enableObjectControls: true, //lets not open too much complexity yet.
			enableFileUpload: true
		});

		this.mon(this.editor, {
			'save': 'onSave',
			'no-body-content': function (editor, node) {
				me.editor.markError(node, getString('NextThought.view.assessment.AssignmentFeedback.empty-editor'));
				return false;
			},
			'activated-editor': function () {
				el.select('.wrap > .message,.wrap > .footer').setVisibilityMode(Ext.dom.Element.DISPLAY);
				el.select('.wrap > .message,.wrap > .footer').hide();
				editorBox.addCls('editor-active');
			},
			'deactivated-editor': function () {
				el.select('.wrap > .message,.wrap > .footer').show();
				editorBox.removeCls('editor-active');
			}
		});

		this.editor.editBody(this.record.get('body'));
		this.editor.activate();
	},


	onSave: function (editor, record, value) {
		var me = this;
		editor.mask(getString('NextThought.view.assessment.AssignmentFeedback.editor-mask'));
		if (!record) {
			console.error('No record!');
			return;
		}
		var originalBody = record.get('body');
		record.set('body', value.body);
		record.saveData()
				.then(function () {
					editor.deactivate();
					editor.setValue('');
					editor.unmask();
					me.update();
				})
				.catch(function (reason) {
					console.error('Failled to update feedback: ', reason);
					record.set('body', originalBody);
					editor.unmask();

					//TODO: Unify these into one place.
					const {response: err} = reason;
					const maxSize = FilePicker.getHumanReadableFileSize(err.max_bytes),
						currentSize = FilePicker.getHumanReadableFileSize(err.provided_bytes);

					if (err.code === 'MaxFileSizeUploadLimitError') {
						err.message += ' Max File Size: ' + maxSize + '. Your uploaded file size: ' + currentSize;
					}
					if (err.code === 'MaxAttachmentsExceeded') {
						err.message += ' Max Number of files: ' + err.constraint;
					}

					let msg = err && err.message || 'Could not save reply';
					alert({title: 'Attention', msg: msg, icon: 'warning-red'});
				})
				//This catch will only fire if the above catch throws something
				.catch(function (reason) {
					console.error('Failed:', reason);
					alert({
						title: getString('NextThought.view.assessment.AssignmentFeedback.error-title'),
						msg: getString('NextThought.view.assessment.AssignmentFeedback.error-msg')
					});
				});
	},


	onFeedbackClick: function (e) {
		let c = this.record.get('Creator');
		let whiteboard = e.getTarget('.whiteboard-container');

		if (whiteboard) {
			this.whiteboardContainerClick(e, whiteboard);
		} else if ((e.getTarget('.avatar') || e.getTarget('.name')) && c && c.getProfileUrl) {
			this.navigateToProfile(c);
		} else if (e.getTarget('.link.edit')) {
			this.openEditorFor(this.record, this.el);
		} else if (e.getTarget('.link.delete')) {
			if (this.doDelete) {
				this.doDelete(this.record);
			}
		}
		else if (e.getTarget('.attachment-part') && !e.getTarget('.download')) {
			this.handleAttachmentClick(e);
		}
	},


	whiteboardContainerClick (e, container) {
		let bodyDivider = e.getTarget('.body-divider');
		let guid = bodyDivider && bodyDivider.id;
		let data = guid && this.wbData[guid];

		if (!data) {
			console.error('No data for whitebard:', container);
		} else if (e.getTarget('.reply')) {
			let editor = this.openReply();
			editor.addWhiteboard(Ext.clone(data), guid + '-reply');
		} else {
			Ext.widget('wb-window', {width: 802, value: data, readonly: true}).show();
		}
	},


	handleAttachmentClick: function (e) {
		let el = e.getTarget('.attachment-part'),
			part = this.getAttachmentPart(el);

		if (part  && !e.getTarget('.download')) {
			e.stopEvent(e);

			if (!this.ContentViewerActions) {
				this.ContentViewerActions = ContentviewerActions.create();
			}
			this.ContentViewerActions.showAttachmentInPreviewMode(part, this.record);
		}
	},


	getAttachmentPart: function (el) {
		let name = el && el.getAttribute && el.getAttribute('name');

		if (!name || !this.record) {
			return null;
		}

		let body = this.record.get('body') || [], part;

		body.forEach(function (p) {
			if (p.name === name) {
				part = p;
				return false;
			}
		});

		return part;
	}
});
