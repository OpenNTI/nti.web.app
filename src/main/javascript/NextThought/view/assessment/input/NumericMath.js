Ext.define('NextThought.view.assessment.input.NumericMath',{
	extend: 'NextThought.view.assessment.input.FreeResponse',
	alias: 'widget.question-input-numericmathpart',

	keyFilter: function(e,d){
		var chr,
			r = this.callParent(arguments),
			COMMA = 188,
			PERIOD = 190;

		if(r===false){return r;}

		chr = e.getCharCode();

		if((chr < e.ZERO || chr > e.NINE) && chr !== COMMA && chr !== PERIOD ){
			console.log('char:',chr);
			e.stopEvent();
			return false;
		}
	}
});
