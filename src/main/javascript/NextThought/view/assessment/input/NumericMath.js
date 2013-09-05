Ext.define('NextThought.view.assessment.input.NumericMath',{
	extend: 'NextThought.view.assessment.input.FreeResponse',
	alias: 'widget.question-input-numericmathpart',

	allowKeys: {},

	keyFilter: function(e,d){
		var chr = e.getCharCode(),
			mod=e.altKey||e.ctrlKey||e.shiftKey,
			r = this.callParent(arguments);

		console.log('typed', chr);

		if(mod || r===false){return r;}

		if(!this.allowKeys[chr]){
			e.stopEvent();
			return false;
		}
	}
}, function(){
	function range(a,b){ var i = m.min(a,b), e = m.max(a,b); for(e;e>=i;e--){ me.allowKeys[e]=1; } }
	function set(){ var i = arguments.length; for(i;i>=0;i--){me.allowKeys[arguments[i]]=1;} }

	var me = this.prototype,
		m = Math,
		c = Ext.EventObject;


	range(c.PAGE_UP, c.NINE);//number keys accross the top of keyboard, and home/page/etc...
	range(c.NUM_ZERO, c.NUM_DIVISION);//num pad keys
	range(c.SHIFT, c.ALT);
	range(187, 191);
	set(c.BACKSPACE,c.ENTER,c.TAB,c.NUM_CENTER,188/*Comma*/,190/*Period*/,106/*astrix*/);
});
