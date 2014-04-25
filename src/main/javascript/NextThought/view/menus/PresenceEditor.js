Ext.define('NextThought.view.menus.PresenceEditor', {
	extend: 'Ext.Editor',
	alias: 'widget.presence-editor',

	allowBlur: false,
	cancelOnBlur: true, //Only valid if allowBlur is true this has no effect.  If allowBlur is false this will trigger a blur to cancel edit

	ignoreNoChange: false,
	revertInvalid: false,
	alignment: 'l-l',
	updateEl: true,
	cls: ['meta-editor', 'presence-editor'],


	controlTemplateObj: {
		cls: 'controls',
		cn: [{cls: 'cancel'}, {cls: 'save', html: getString('NextThought.view.menus.PresenceEditor.save')}]
	},


	afterRender: function() {
		this.callParent(arguments);
		Ext.DomHelper.append(this.el, this.controlTemplateObj);
		this.mon(this.el.down('.save'), 'click', 'completeEdit', this);
		this.mon(this.el.down('.cancel'), 'click', 'handleCancel', this);

		this.mon(this.el, {
			keydown: function(e) { e.stopPropagation(); },
			keypress: function(e) { e.stopPropagation(); },
			keyup: function(e) { e.stopPropagation(); }
		});
	},

	handleCancel: function() {
		if (Ext.isEmpty(this.field.getValue())) {
			this.cancelEdit();
			return;
		}
		this.field.setValue('');
		this.field.focus();
	},

	completeEdit: function(e) {
		if (e && e.stopPropagation && e.type === 'click') {
			e.stopPropagation();
		}
		return this.callParent(arguments);
	}
});
