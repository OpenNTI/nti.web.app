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

		if (this._value) {
			this.setValue(this._value);
			delete this._value;
		}
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
		if (!this.rendered) {
			this._value = value;
			return;
		}

		console.log(value);
		var inputName;

		for (inputName in value) {
			if (value.hasOwnProperty(inputName)) {
				this.setFieldValue(inputName, value[inputName]);
			}
		}
	},


	setFieldValue: function(name, value) {
		var dom = Ext.getDom(this.el),
			input = dom && dom.querySelector('input[name="' + name + '"]');

		if (!input) {
			console.warn('There was no input for name: ' + name);
			return;
		}

		input.value = value;
	},


	markCorrect: function() {
		this.markGraded();
		this.callParent(arguments);
	},


	markIncorrect: function() {
		this.markGraded();
		this.callParent(arguments);
	},


	markGraded: function(yes) {
		var action = yes !== false ? 'addCls' : 'removeCls';
		this.el[action]('graded');
		this.el.select('span.blank')[action]('graded');
	},

	reset: function() {
		this.markGraded(false);
		this.callParent(arguments);
	}
});
