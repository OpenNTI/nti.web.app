const Ext = require('extjs');
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
		return new Promise(function (fulfill) {
			r.compileBodyContent(fulfill);
		});
	},


	openEditorFor: function (record, el) {
		var me = this,
			editorBox = this.el.down('.wrap');

		if (this.editor) {
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
			'no-body-content': function (editor, el) {
				me.editor.markError(el, getString('NextThought.view.assessment.AssignmentFeedback.empty-editor'));
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

		record.set('body', value.body);
		record.saveData()
				.then(function () {
					editor.deactivate();
					editor.setValue('');
					editor.unmask();
					me.update();
				})
				.catch(function (reason) {
					editor.unmask();
					alert({
						title: getString('NextThought.view.assessment.AssignmentFeedback.error-title'),
						msg: getString('NextThought.view.assessment.AssignmentFeedback.error-msg')
					});
					console.error('Failled to update feedback: ' + reason);
				});
	},


	onFeedbackClick: function (e) {
		var c = this.record.get('Creator');

		if ((e.getTarget('.avatar') || e.getTarget('.name')) && c && c.getProfileUrl) {
			this.navigateToProfile(c);
		} else if (e.getTarget('.link.edit')) {
			this.openEditorFor(this.record, this.el);
		} else if (e.getTarget('.link.delete')) {
			if (this.doDelete) {
				this.doDelete(this.record);
			}
		}
	}
});
