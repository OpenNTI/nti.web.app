const Ext = require('@nti/extjs');
const {wait} = require('@nti/lib-commons');

const EditingActions = require('../../Actions');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.outline.outlinenode.AddNode', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-new-unit-node',
	autoPublish: true,
	cls: 'new-node unit',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'inline-editor-container'},
		{cls: 'icon {iconCls}'},
		{cls: 'title', html: '{title}'}
	]),

	renderSelectors: {
		inlineEditorEl: '.inline-editor-container',
		addLessonEl: '.title'
	},

	beforeRender: function () {
		this.callParent(arguments);

		this.EditingActions = EditingActions.create();

		this.renderData = Ext.apply(this.renderData || {}, {
			iconCls: this.iconCls,
			title: this.title
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.addLessonEl, 'click', this.onClick.bind(this));
		this.inlineEditorEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.inlineEditorEl.hide();

		if (this.InlineEditor) {
			this.editor = this.InlineEditor.create();
			this.editor.onSave = this.onSave.bind(this);
			this.editor.onCancel = this.onCancel.bind(this);
			this.editor.parentRecord = this.parentRecord;

			this.editor.render(this.inlineEditorEl);
		}
	},

	/**
	 * handles a click on the addLesson Button
	 *
	 * Note: If the inline editor is visible, the click action implies that we should save the new node.
	 * However, if the inline editor is hidden, the click action implies that we should show it.
	 *
	 * @param  {Event} e Browser Event
	 * @returns {void}
	 */
	onClick: function (e) {
		const me = this;
		const bodyListEl = this.el && this.el.up('.outline-list');

		if (!this.inlineEditorEl.isVisible()) {
			this.showEditor();
		} else {
			this.addLessonEl.hide();

			this.onSave(e)
				.then(function (rec) {
					if (me.afterSave) {
						me.afterSave(rec);
					}
					me.el.scrollIntoView(bodyListEl);
					me.addLessonEl.show();
				}).catch(() => {
					me.addLessonEl.show();
				});
		}
	},

	showEditor: function () {
		this.inlineEditorEl.show();

		if (this.onEditorShow) {
			this.onEditorShow();
		}

		if (this.editor.setSuggestTitle) {
			this.editor.setSuggestTitle();
		}
	},

	hideEditor: function () {
		if (this.onEditorHide) {
			this.onEditorHide();
		}

		if (!this.rendered) { return; }

		this.inlineEditorEl.hide();
	},

	isValid: function () {
		if (this.editor.isValid && !this.editor.isValid()) {
			if (this.editor.showError) {
				this.editor.showError();
			}
			return false;
		}
		return true;
	},

	onCancel: function (e) {
		this.hideEditor();
	},

	/**
	 * Handle saving a new unit node.
	 * On top of save new unit node, we would also like to publish them right away.
	 * That's what we're doing after successfully creating a new unit node.
	 * That behavior may eventually change, in which case this will need to be adjusted too.
	 *
	 * @param  {Event} e  Browser click event
	 * @return {Promise}   returns a promise that fulfills after the record is published.
	 */
	onSave: function (e) {
		var me = this,
			values = me.editor.getValue(),
			outline = me.outlineCmp && me.outlineCmp.outline,
			parent, shouldNavigate = e.getKey() === e.ENTER;

		if (!me.isValid()) {
			return Promise.reject();
		}

		if (!me.parentRecord) {
			return Promise.reject();
		}

		if (this.editor.el) {
			this.editor.el.mask('Saving');
		}

		//In case the outline node changed, reset it.
		//This ensures that we have the right set of listeners set.
		if (outline && this.parentRecord !== outline && this.parentRecord.getId() === outline.getId()) {
			parent = outline;
		} else {
			parent = this.parentRecord;
		}

		return parent.appendContent(values)
			.then(function (rec) {
				if (me.autoPublish) {
					me.EditingActions.publish(rec);
				}

				me.editor.el.unmask();
				me.hideEditor();
				if (shouldNavigate && me.doSelectNode) {
					me.doSelectNode(rec);
				}
				else {
					wait()
						.then(function () {
							if (me.editor.setSuggestTitle) {
								me.editor.setSuggestTitle();
							}
						});
				}

				return rec;
			});
	}
});
