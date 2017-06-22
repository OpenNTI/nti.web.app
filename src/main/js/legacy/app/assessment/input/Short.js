const Ext = require('extjs');

require('legacy/mixins/QuestionContent');
require('./Base');


module.exports = exports = Ext.define('NextThought.app.assessment.input.Short', {
	extend: 'NextThought.app.assessment.input.Base',
	alias: [
		'widget.question-input-fillintheblankshortanswerpart'
	],


	cls: 'shortanswer-input',

	mixins: {
		questionContent: 'NextThought.mixins.QuestionContent'
	},

	inputTpl: Ext.DomHelper.markup({ cls: 'fill-in', html: '{lineWithBlank}' }),

	blankTpl: Ext.DomHelper.createTemplate({ tag: 'span', cls: 'blank'}),


	solTpl: Ext.DomHelper.createTemplate({
		cls: 'multiple-choice-solution',
		cn: ['{0} ', {tag: 'span', cls: 'solution-choice-text', html: '{1}'}]
	}),

	wordTpl: Ext.DomHelper.createTemplate(
		{tag: 'span', cls: 'target wordentry drag graded', html: '{0}'}
	),


	beforeRender: function () {
		this.callParent(arguments);
		Ext.apply(this.renderData, {
			lineWithBlank: this.buildContent(this.filterHTML(this.part.get('input')))
		});
	},


	afterRender: function () {
		var me = this, ctEl,
			tpl = me.blankTpl;
		me.callParent(arguments);
		ctEl = me.getContentElement();
		me.blankInputs = me.inputBox.query('input[type="blankfield"]');

		function setup (i, tag) {
			if (!i) {return;}

			var blank = tpl.insertBefore(i),
				size = i.getAttribute('maxlength');

			if (tag) {
				blank.setAttribute('data-input', '1');
				return;
			}

			blank.appendChild(i);
			if (size) {
				i.setAttribute('size', size);
			}
		}

		me.blankInputs.forEach(function (i) {
			var name = i.getAttribute('name');
			setup(i);
			if (ctEl) {
				setup(ctEl.querySelector('input[name="' + name + '"]'), true);
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


	getContentElement: function () {
		var ct = this.callParent(arguments);
		if (!ct.classList.contains('naqfillintheblankshortanswerpart')) {
			Ext.Error.raise('Part Ordinal Mismatch');
		}

		return ct;
	},


	getSolutionContent: function (part) {
		function re (original, attrs) {
			attrs = (attrs || '').trim().split(/\s/);

			if (/type=(\"|\')?blankfield/i.test(attrs)) {
				attrs = ((/name=\W?(\w+)\W?/).exec(attrs) || [])[1];
				if (attrs) {
					return '{' + attrs + '} ';//the inputs don't have a space between them and the following words. :/
				}
			}

			return original;
		}

		var me = this,
			out = [], tpl = me.solTpl,
			pillTpl = me.wordTpl,
			line = Ext.DomHelper.createTemplate(
				me.filterHTML(
					me.part.get('input')
						.replace(/<input([^>]+?)\/?>/igm, re)));

		Ext.each(part.get('solutions'), function (sol) {
			var x = sol.get('value');
			// x may or may not be an Array.  Ext.each handles that for us.
			Ext.each(x, function (s) {
				var k, v = {}, o;
				for (k in s) {
					if (s.hasOwnProperty(k)) {
						o = s[k] || '';

						if (typeof o !== 'string') {
							console.warn('Probably dropping question solution... its not a simple value. %o', o);
							o = o.solution;
						}

						v[k] = o ? pillTpl.apply([o]) : '';
					}
				}

				out.push(tpl.apply([
					line.apply(v)
				]));
			});
		});

		return out.join('');
	},


	checkSubmissionState: function () {
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


		this[allFilledIn
			? 'enableSubmission'
			: 'disableSubmission']();
	},


	hasValue: function () {
		var isEmpty;

		isEmpty = (this.blankInputs || []).every(function (input) {
			return !!input.value;
		});

		return isEmpty;
	},


	getValue: function () {
		var value = {};

		(this.blankInputs || []).forEach(function (input) {
			var name = input.getAttribute('name');
			value[name] = input.value || null;
		});
		return value;
	},


	setValue: function (value) {
		if (!this.rendered) {
			this._value = value;
			return;
		}

		console.log(value);
		var inputName;

		if (value) {
			for (inputName in value) {
				if (value.hasOwnProperty(inputName)) {
					this.setFieldValue(inputName, value[inputName]);
				}
			}
		}
	},


	setFieldValue: function (name, value) {
		var dom = Ext.getDom(this.el),
			input = dom && dom.querySelector('input[name="' + name + '"]');

		if (!input) {
			console.warn('There was no input for name: ' + name);
			return;
		}

		input.value = value;
	},


	markCorrect: function () {
		this.markGraded();
		this.callParent(arguments);
	},


	markIncorrect: function () {
		this.markGraded();
		this.callParent(arguments);
	},


	markSubmitted: function () {
		this.markGraded();
		this.callParent(arguments);
	},


	markGraded: function (yes) {
		var action = yes !== false ? 'addCls' : 'removeCls';
		this.el[action]('graded');
		this.el.select('span.blank')[action]('graded');

		this.el.select('span.blank input').set({disabled: yes !== false ? true : undefined});
	},

	reset: function () {
		this.markGraded(false);
		this.callParent(arguments);

		var inputs = this.el.select('.blank input');

		inputs.each(function (i) {
			i.dom.value = '';
		});
	}
});
