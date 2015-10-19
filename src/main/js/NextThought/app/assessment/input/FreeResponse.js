Ext.define('NextThought.app.assessment.input.FreeResponse', {
	extend: 'NextThought.app.assessment.input.Base',
	alias: 'widget.question-input-freeresponsepart',

	SaveProgressBuffer: 5000,

	inputTpl: Ext.DomHelper.markup({
		tag: 'input',
		type: 'text',
		placeholder: '{{{NextThought.view.assessment.input.FreeResponse.answer}}}',
		tabIndex: '{tabIndex}',
		cls: 'answer-field tabable'
	}),

	renderSelectors: {
		inputField: '.answer-field'
	},


	initComponent: function() {
		this.renderData = Ext.apply(this.renderData || {}, {
			tabIndex: this.tabIndexTracker.getNext()
		});

		this.callParent(arguments);
	},


	afterRender: function() {
		this.solutionAnswerBox.insertFirst([getString('NextThought.view.assessment.input.FreeResponse.answer') + ': ', {tag: 'span'}]);
		this.solutionAnswerBox = this.solutionAnswerBox.down('span');

		this.callParent(arguments);

		this.setupAnswerLabel(this.part.get('answerLabel'));

		this.mon(this.inputField, {
			scope: this,
			blur: function(e, dom) { dom.setAttribute('placeholder', getString('NextThought.view.assessment.input.FreeResponse.answer')); },
			focus: function(e, dom) { dom.removeAttribute('placeholder'); },
			keyup: function(e, dom) {
				if (dom.value === '') { this.disableSubmission(); }
				else { this.enableSubmission(); }
			},
			keydown: this.keyFilter,
			paste: function(e) {
				e.stopEvent();
				return false;
			}
		});
	},


	setupAnswerLabel: function(label) {
		if (!label) {return;}

		var i = this.inputField,
			el = this.answerLabelEl =
			Ext.DomHelper.append(this.inputBox, {cls: 'label', html: label},true);

		el.hide();

		function show() {
			var l, m = new Ext.util.TextMetrics();
			m.bind(i);
			l = 10 + m.getWidth(i.getValue());

			m.destroy();
			el.setStyle({left: l + 'px'});
			el.show();
		}

		this.mon(i, {
			scope: this,
			blur: function() { el.hide(); },
			focus: show,
			keyup: show
		});
	},


	keyFilter: function(e, dom) {
		if (e.getKey() === e.ENTER) {
			this.submitOrTabNext(dom);
			e.stopEvent();
			return false;
		}
	},

	canHaveAnswerHistory: function() {
		return this.questionSet ? false : true;
	},

	getValue: function() {
		return this.inputField.getValue().trim();
	},


	setValue: function(str) {
		if (!Ext.isString(str)) {
			str = (str && str.value || [])[0] || '';
		}

		var d = document.createElement('div');
		d.innerHTML = str;

		this.inputField.dom.value = d.textContent;
	},


	markSubmitted: function(cls) {
		this.callParent(arguments);

		var b = this.inputBox.removeCls('incorrect correct');
		if (!Ext.isEmpty(cls)) {b.addCls(cls);}
		this.inputField.set({disabled: 'disabled', readOnly: true, placeholder: ''});
	},


	reset: function() {
		this.callParent(arguments);
		this.inputBox.removeCls(['incorrect', 'correct']);
		this.inputField.set({
			disabled: undefined,
			readOnly: undefined,
			placeholder: getString('NextThought.view.assessment.input.FreeResponse.answer')
		});
		this.inputField.dom.value = '';
		//this.inputField.focus();
	}
});
