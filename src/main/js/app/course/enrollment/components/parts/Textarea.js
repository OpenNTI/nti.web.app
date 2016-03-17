export default Ext.define('NextThought.app.course.enrollment.components.parts.Textarea', {
	extend: 'NextThought.app.course.enrollment.components.parts.BaseInput',
	alias: 'widget.enrollment-textarea',

		renderTpl: Ext.DomHelper.markup([
		{cls: 'input-container enrollment-input text {required} {size}', cn: [
			{tag: 'textarea', placeholder: '{placeholder}'}
		]},
		{tag: 'tpl', 'if': 'help', cn: [
			{cls: 'help', cn: [
				{cls: 'information', html: '{help}'}
			]}
		]}
	]),

	renderSelectors: {
		textareaEl: '.input-container textarea'
	},

	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			required: this.required ? 'required' : '',
			size: this.size,
			help: this.help,
			placeholder: this.placeholder
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		if (this.focusEvent) {
			this.mon(this.textareaEl, 'focus', this.fireEvent.bind(this, this.focusEvent));
		}
	},


	setUpChangeMonitors: function() {
		if (this.textareaEl) {
			this.mon(this.textareaEl, 'keyup', 'changed');
		}
	},


	addError: function() {
		this.addCls('error');
	},


	removeError: function() {
		this.removeCls('error');
	},


	isEmpty: function() {
		return !this.textareaEl || !this.textareaEl.getValue();
	},


	setValue: function(value) {
		if (!this.rendered) {
			this.startingValue = value;
		} else {
			this.textareaEl.el.dom.value = value;
		}
	},


	getValue: function() {
		var value = {},
			val;

		if (this.textareaEl) {
			val = this.textareaEl.getValue();
		}

		if (val) {
			value[this.name] = val;
		}

		return value;
	}
});
