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
				me.messageEl.update(html);
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
		var me = this;


		el.select('.message,.footer').remove();
		Ext.destroy(me.editEditor);
		me.editEditor = Ext.widget('nti-editor', {
			ownerCt: this,
			renderTo: el.down('.wrap'),
			record: record,
			enableObjectControls: false, //lets not open too much complexity yet.
			listeners: {
				save: function (editor, record, value) {
					editor.mask(getString('NextThought.view.assessment.AssignmentFeedback.editor-mask'));
					if (!record) {
						console.error('No record!');
						return;
					}
					record.suspendEvents();
					record.set('body', value.body);
					record.save({
						callback: function (q, s, r) {
							record.resumeEvents();
							editor.unmask();
							if (!s) {
								alert({
									title: getString('NextThought.view.assessment.AssignmentFeedback.error-title'),
									msg: getString('NextThought.view.assessment.AssignmentFeedback.error-msg')
								});
								console.error('Failled to update feedback');
								return;
							}
							Ext.destroy(editor);

							try {
								var view = me.down('dataview');
								if (view) {
									view.refresh();
								}
							} catch (e) {
								console.error(e.message);
							}
						}
					});
				},
				'deactivated-editor': function () {
					var view = me.down('dataview');

					if (view) {
						view.refresh();
					}
				}
			}
		});

		me.editEditor.editBody(record.get('body'));

		me.editEditor.activate();
	},


	onFeedbackClick: function (e) {
		var c = this.record.get('Creator');

		if ((e.getTarget('.avatar') || e.getTarget('.name')) && c && c.getProfileUrl) {
			this.navigateToProfile(c);
		} else if (e.getTarget('.link.edit')) {
			this.openEditorFor(this.editor, this.el);
		} else if (e.getTarget('.link.delete')) {
			if (this.doDelete) {
				this.doDelete(this.record);
			}
		}
	}
});
