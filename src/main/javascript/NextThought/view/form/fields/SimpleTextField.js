Ext.define('NextThought.view.form.fields.SimpleTextField',{
	extend: 'Ext.Component',
	alias: 'widget.simpletext',


	constructor: function(config){
		this.autoEl = Ext.apply(config.autoEl||{},{
			tag: 'input',
			type: 'text'
		});
		delete config.autoEl;
		return this.callParent(arguments);
	},


	setError: function(){
		var e = this.getEl();
		e.addCls('error-saving');
		setTimeout(function(){ e.removeCls('error-saving'); },750);
	},


	clearValue: function(){
		var e = this.getEl();
		e.dom.value = '';
		e.removeCls('error-saving');
		this.keyPressed(new Ext.EventObjectImpl());
	},


	getValue: function(){
		return this.getEl().getValue();
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.getEl(),{
			scope: this,
			keyup: this.keyPressed,
			keydown: this.keyDown //keypress does not always fire for escape
		});
	},


	specialKeys: {
		27: true,	//Ext.EventObject.prototype.ESC
		8: true,	//Ext.EventObject.prototype.BACKSPACE
		46: true	//Ext.EventObject.prototype.DELETE
	},


	keyDown: function(event) {
		var k = event.getKey();
		if(this.specialKeys[k]){
			if(k === event.ESC){
				this.getEl().dom.value = '';
			}
			event.stopPropagation();
			this.keyPressed(event);
		}
	},


	keyPressed: function(event){
		var k = event.getKey(),
			v = this.getValue();
		if (k === event.ENTER || k === event.ESC )  {
			this.fireEvent('commit', v );
		}

		if( this.lastValue !== v ){
			this.lastValue = v;
			this.fireEvent('changed', v );
		}
	}


});

