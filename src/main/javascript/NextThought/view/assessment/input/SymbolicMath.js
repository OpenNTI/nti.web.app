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

		var s = this.mathquillSpan = this.spanTpl.insertAfter(this.inputField);
		jQuery(s).mathquill('editable');
		this.inputField.hide();
	},


	mathSymbolClicked: function(e){
		var t = e.getTarget();
		jQuery(this.mathquillSpan).mathquill('write', t.getAttribute('data-latex'));
	},


	getValue: function(){
		return jQuery(this.mathquillSpan).mathquill('latex');
	},


	setValue: function(latex){
		console.log('does this clear it first???');
		jQuery(this.mathquillSpan).mathquill('latex', latex);
	}
});
