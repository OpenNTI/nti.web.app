Ext.define('NextThought.view.courseware.enrollment.parts.SplitRadio', {
	extend: 'NextThought.view.courseware.enrollment.parts.RadioGroup',
	alias: 'widget.enrollment-split-radio',

	initComponent: function() {
		this.options = [{
			text: this.text,
			value: this.value,
			name: this.name
		}];
	},

	setValue: function(value) {
		if (!this.rendered) {
			this.on('afterrender', this.setValue.bind(this, value));
			return;
		}

		var checkbox = this.el.down('[type=radio]');

		checkbox.dom.checked = this.value === value;
	},

	getValue: function() {
		var isChecked = this.el.down('input[type=radio]:checked'),
			val = {};

		if (isChecked) {
			val[this.name] = this.value;
		}

		return val;
	}
});
