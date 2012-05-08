Ext.define('NextThought.view.chat.Entry',{
	extend: 'Ext.Component',
	alias: 'widget.chat-entry',

	height: 51,
	ui: 'chat-entry',
	cls: 'chat-entry',

	renderTpl: [
		'<div>',
			'<input type="text" value="">',
		'</div>'
	],

	chanel: 'DEFAULT',

	renderSelectors: {
		inputEl: 'input'
	},

	afterRender: function(){
		this.callParent(arguments);
		this.inputEl.selectable();
		this.inputEl.on({
			scope: this,
			mousedown: function(e){ e.dragTracked = true; },
			keydown: this.keyDown
		});
	},

	keyDown: function(e){
		var k = e.getKey();
		if(e.ESC === k){
			this.inputEl.set({value:''});
		}
		else if(e.ENTER === k){
			this.fireEvent('send',this, this.replyTo, this.chanel, this.recipients);
		}
	},

	focus: function(){
		this.inputEl.focus();
	},

	getValue: function(){
		var e = this.inputEl,
			v = e.getValue();
		e.dom.value = '';
		return v;
	}
});
