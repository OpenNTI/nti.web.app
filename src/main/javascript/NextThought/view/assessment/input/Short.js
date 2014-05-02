Ext.define('NextThought.view.assessment.input.Short', {
	extend: 'NextThought.view.assessment.input.Base',
	alias: [
		'widget.question-input-fillintheblankshortanswerpart'
	],


	cls: 'shortanswer-input',


	inputTpl: Ext.DomHelper.markup({ cls: 'fill-in', html: '{lineWithBlank}' }),

	blankTpl: Ext.DomHelper.createTemplate({ tag: 'span', cls: 'blank'}),

	beforeRender: function() {
		this.callParent(arguments);
		Ext.apply(this.renderData, {
			lineWithBlank: this.filterHTML(this.part.get('input'))
		});
	},


	afterRender: function() {
		var me = this,
			tpl = me.blankTpl;
		me.callParent(arguments);
		me.blankInputs = me.inputBox.query('input[type="blankfield"]');
		me.blankInputs.forEach(function(i) {
			var blank = tpl.insertBefore(i),
				size = i.getAttribute('maxlength');

			blank.appendChild(i);
			if (size) {
				i.setAttribute('size', size);
			}
		});

		me.mon(new Ext.dom.CompositeElement(me.blankInputs), {
			buffer: 300,
			keyup: 'checkSubmissionState'
		});
	},


	checkSubmissionState: function() {
		var k, v = this.getValue(),
			allFilledIn = true;

		for (k in v) {
			if (v.hasOwnProperty(k)) {
				allFilledIn = !!v[k];
				if (!allFilledIn) {
					break;
				}
			}
		}


		this[allFilledIn ?
			 'enableSubmission' :
			 'disableSubmission']();
	},


	getValue: function() {
		var value = {};

		(this.blankInputs || []).forEach(function(input) {
			var name = input.getAttribute('name');
			value[name] = input.value || null;
		});
		return value;
	},


	setValue: function(value) {
		console.log(value);

		var inputName;

		for (inputName in value) {
			if (value.hasOwnProperty(inputName)) {
				this.setFieldValue(inputName, value[inputName]);
			}
		}
	},


	setFieldValue: function(name, value) {
		this.el.select('input[name="' + name + '"]').setValue(value);
	},


	//markCorrect: function() { this.callParent(arguments); },


	//markIncorrect: function() { this.callParent(arguments); },


	reset: function() {
		this.callParent(arguments);
	}
});
