Ext.define('NextThought.view.profiles.ProfileFieldEditor', {
	extend: 'Ext.Editor',
	alias: 'widget.profile-field-editor',

	updateEl: false,
	allowBlur: false,
	cancelOnBlur: true, //Only valid if allowBlur is true this has no effect.  If allowBlur is false this will trigger a blur to cancel edit

	ignoreNoChange: true,
	revertInvalid: false,
	alignment: 'l-l',

	maxWidth: 620,
	autoSize: {width: 'field'},

	controlTemplateObj: {
		cls: 'controls',
		cn: [
			{cls: 'cancel', html: getString('NextThought.view.profiles.ProfileFieldEditor.cancel')},
			{cls: 'save', html: getString('NextThought.view.profiles.ProfileFieldEditor.save')}
		]
	},


	afterRender: function() {
		this.callParent(arguments);
		Ext.DomHelper.append(this.el, this.controlTemplateObj);
		this.mon(this.el.down('.save'), 'click', this.completeEdit, this);
		this.mon(this.el.down('.cancel'), 'click', this.cancelEdit, this);

		this.on({
			'complete': 'resetBoundEl',
			'canceledit': 'resetBoundEl'
		});

		if (Ext.is.iOS) {
			//Set width of the inputs to less than the length of the upper element, to
			//prevent the save and cancel boxes from going offscreen
			this.autoSize = false;
			this.width = 600;
			if (Ext.query('.about.field')[0]) {
				this.width = Ext.get(Ext.query('.about.field')[0]).getWidth() - 150;
			}
		}

	},


	resetBoundEl: function() {
		this.boundEl.setStyle({textTransform: null});
		Ext.defer(this.boundEl.repaint, 100, this.boundEl);
	},


	startEdit: function(t, v) {
		var me = this, oldWidth = me.autoSize.width;
		//Ensure the editor is wide enough to see something...
		function resetWidth() { me.autoSize.width = oldWidth; }

		if (t.getWidth() < 150) {
			me.autoSize.width = 150;
		}

		this.on({deactivate: resetWidth, single: true});

		if (t.getVisibilityMode() === Ext.Element.DISPLAY) {
			if (!t.isVisible()) {
				t.show();//undo display:none
			}
			t.setVisibilityMode(Ext.Element.VISIBILITY);//ensure we are not mode DISPLAY...otherwise we can't align to it.
		}
		t.setStyle({textTransform: 'none'});//temporarily remove any transforms so we can edit the raw value.
		return this.callParent([t, v]);
	}
});
