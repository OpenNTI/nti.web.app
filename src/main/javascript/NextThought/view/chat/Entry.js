Ext.define('NextThought.view.chat.Entry', {
	extend:'Ext.Component',
	alias:'widget.chat-entry',

	height:51,
	ui:'chat-entry',
	cls:'chat-entry',

	renderTpl:Ext.DomHelper.markup([
		{
			cn:[
				{
					cls:'add-whiteboard', 'data-qtip':'Create a whiteboard'
				},
				{
					cn:[
						{ tag:'input', type:'text'}
					]
				}
			]
		}
	]),

	chanel:'DEFAULT',

	renderSelectors:{
		buttonEl:'.add-whiteboard',
		inputEl:'input'
	},

	afterRender:function () {
		this.callParent(arguments);
		this.inputEl.selectable();
		this.inputEl.on({
			scope:this,
			keydown:this.keyDown
		});

		var me = this;
		this.buttonEl.on('click', this.addWhiteboard, this);
	},

	keyDown:function (e) {
		var k = e.getKey();
		if (e.ESC === k) {
			this.inputEl.set({value:''});
		}
		else if (e.ENTER === k) {
			this.fireEvent('send', this, this.replyTo, this.chanel, this.recipients);
		}
	},

	focus:function () {
		this.inputEl.focus();
	},

	getValue:function () {
		var e = this.inputEl,
			v = e.getValue();
		e.dom.value = '';
		return v;
	},


	addWhiteboard:function () {
		this.fireEvent('send-whiteboard', this, this.replyTo, this.chanel, this.recipients);
	}
});
