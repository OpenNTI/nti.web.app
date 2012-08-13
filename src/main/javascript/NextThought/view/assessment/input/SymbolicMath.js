Ext.define('NextThought.view.assessment.input.SymbolicMath',{
	extend: 'NextThought.view.assessment.input.FreeResponse',
	alias: 'widget.question-input-symbolicmathpart',

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
	},


	mathSymbolClicked: function(e){
		var t = e.getTarget();
		this.inputField.dom.value += t.getAttribute('data-latex');
	}
});
