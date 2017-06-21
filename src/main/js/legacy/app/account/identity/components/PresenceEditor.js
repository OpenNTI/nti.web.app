const Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.account.identity.components.PresenceEditor', {
	extend: 'Ext.Editor',
	alias: 'widget.presence-editor',

	allowBlur: false,
	cancelOnBlur: true, //Only valid if allowBlur is true this has no effect. If allowBlur is false this will trigger a blur to cancel edit

	ignoreNoChange: false,
	revertInvalid: false,
	alignment: 'l-l',
	updateEl: true,
	cls: ['meta-editor', 'presence-editor'],

	controlTemplateObj: {
		cls: 'controls',
		cn: [{cls: 'cancel'}, {cls: 'save', html: getString('NextThought.view.menus.PresenceEditor.save')}]
	},


	afterRender: function () {
		this.callParent(arguments);

		Ext.DomHelper.append(this.el, this.controlTemplateObj);

		this.mon(this.el.down('.save'), 'click', this.completeEdit.bind(this));
		this.mon(this.el.down('.cancel'), 'click', this.handleCancel.bind(this));

		this.mon(this.el, {
			keydown: function (e) { e.stopPropagation(); },
			kepress: function (e) {e.stopPropagation(); },
			keyup: function (e) {e.stopPropagation(); }
		});
	},


	startEdit: function () {
		this.callParent(arguments);

		var total = this.el.getWidth() || 0,
			controls = this.el.down('.controls'),
			controlWidth = controls && controls.getWidth();

		if (controlWidth) {
			this.el.down('input').setWidth(total - controlWidth);
		}
	},


	handleCancel: function () {
		if (Ext.isEmpty(this.field.getValue())) {
			this.cancelEdit();
			return;
		}

		this.field.setValue('');
		this.field.focus();
	},


	completedEdit: function (e) {
		if (e && e.stopPropagation && e.type === 'click') {
			e.stopPropagation();
		}

		return this.callParent(arguments);
	}
});
