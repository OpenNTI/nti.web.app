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

	initComponent: function(){
		this.addEvents({ 'status-change': true });
		this.enableBubble(['status-change']);
		this.callParent(arguments);
	},

	afterRender:function () {
		this.callParent(arguments);
		this.inputEl.selectable();
		this.inputEl.on({
			scope:this,
			keydown:this.keyDown,
			keyup: this.keyUp,
			focus: function(){ this.fireEvent('status-change', {status: 'active'});}
		});

		var me = this;
		this.buttonEl.on('click', this.addWhiteboard, this);
	},

	keyUp: function(e){
		var me = this, k = e.getKey(e);

		if( e.ENTER !== k ){
			this.fireEvent('status-change', {'status': 'composing'});
			clearTimeout(me.pauseTimer);
			//If the user pass a given number of seconds without typing, fire a paused event.
			me.pauseTimer = setTimeout(function(){ me.fireEvent('status-change', {status:'paused'}); }, 5000);
		}
		else{
			clearTimeout(me.pauseTimer);
			this.fireEvent('status-change', {'status': 'active'});
		}
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
