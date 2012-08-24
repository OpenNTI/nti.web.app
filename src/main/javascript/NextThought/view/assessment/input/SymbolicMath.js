Ext.Loader.setPath('jQuery.fn.mathquill', 'resources/lib/mathquill/mathquill.min.js');


Ext.define('NextThought.view.assessment.input.SymbolicMath',{
	extend: 'NextThought.view.assessment.input.FreeResponse',

	requires: [
		'jQuery.fn.mathquill'
	],

	alias: 'widget.question-input-symbolicmathpart',

	spanTpl: Ext.DomHelper.createTemplate({tag: 'span'}).compile(),

	toolbarTpl: Ext.DomHelper.markup([
		{ cls: 'mathsymbol sqrt', 'data-latex': '\\\\surd' },
		{ cls: 'mathsymbol square', 'data-latex': 'x^2' },
		{ cls: 'mathsymbol parens', 'data-latex': '(x)'},
		{ cls: 'mathsymbol approx', 'data-latex': '\\\\approx' },
		{ cls: 'mathsymbol pi', 'data-latex': '\\\\pi' }
	]),


	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.getEl().select('.mathsymbol'),{
			scope: this,
			click: this.mathSymbolClicked
		});

		var s = this.mathquillSpan = this.spanTpl.insertAfter(this.inputField),
			me = this,
			r = jQuery(s).mathquill('editable'),
			timer;

		//bind on kepress so we can adjust size:
		r.bind('keypress.mathquill', function(){
			clearTimeout(timer);
			timer = setTimeout(function(){
				me.adjustSize();
			}, 100);

		});

		//console.log('mathquill returned:', r);
		this.inputField.hide();
	},


	adjustSize: function(){
		var currentHeight = this.inputBox.getHeight();

		if (currentHeight !== this.lastHeight){
			this.updateLayout();
		}

		this.lastHeight = currentHeight;
	},


	mathSymbolClicked: function(e){
		var t = e.getTarget();
		jQuery(this.mathquillSpan).mathquill('write', t.getAttribute('data-latex'));
	},


	getValue: function(){
		return jQuery(this.mathquillSpan).mathquill('latex');
	},


	setValue: function(latex){
		jQuery(this.mathquillSpan).mathquill('latex', latex);
		this.adjustSize();
	},

	reset: function(){
		this.callParent(arguments);
		this.setValue('');
	}
});
