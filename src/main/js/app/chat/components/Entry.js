export default Ext.define('NextThought.app.chat.components.Entry', {
	extend: 'Ext.Component',
	alias: 'widget.chat-entry',

	height: 61,
	ui: 'chat-entry',
	cls: 'chat-entry',

	requires: [
		'NextThought.app.chat.Actions'
	],

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'entry-wrapper',
			cn: [
				{
					cls: 'add-whiteboard', 'data-qtip': '{{{NextThought.view.chat.Entry.create-whiteboard}}}'
				},
				{
					cn: [
						{ tag: 'input', type: 'text', placeholder: 'Message...'}
					]
				}
			]
		}
	]),

	chanel: 'DEFAULT',

	renderSelectors: {
		buttonEl: '.add-whiteboard',
		inputEl: 'input'
	},

	initComponent: function() {
		this.addEvents({ 'status-change': true });
		this.enableBubble(['status-change']);
		this.callParent(arguments);

		this.ChatActions = NextThought.app.chat.Actions.create();
	},

	afterRender: function() {
		this.callParent(arguments);
		this.inputEl.selectable();
		this.inputEl.on({
			keydown: this.keyDown.bind(this),
			keyup: this.keyUp.bind(this),
			focus: this.fireEvent.bind(this, 'status-change', {status: 'active'})
		});

		this.buttonEl.on('click', this.addWhiteboard.bind(this));
	},

	keyUp: function(e) {
		var me = this, k = e.getKey(e);

		if (e.ENTER !== k) {
			this.fireEvent('status-change', {'status': 'composing'});
			clearTimeout(me.pauseTimer);
			//If the user pass a given number of seconds without typing, fire a paused event.
			me.pauseTimer = setTimeout(function() { me.fireEvent('status-change', {status: 'paused'}); }, 3000);
		}
		else {
			clearTimeout(me.pauseTimer);
			this.fireEvent('status-change', {'status': 'active'});
		}
	},

	keyDown: function(e) {
		var k = e.getKey(), me = this;
		if (e.ESC === k) {
			this.inputEl.set({value: ''});
		}
		else if (e.ENTER === k) {
			if (Ext.is.iOS) { //Delay event to allow autocorrect to change word beforehand, instead of after
				wait(10)
					.then(function() {
						me.ChatActions.sendMessage(me, me.replyTo, me.chanel, me.recipients);
					});
			}
			else {
				me.ChatActions.sendMessage(me, me.replyTo, me.chanel, me.recipients);
			}
		}
	},

	focus: function(defer) {
		this.inputEl.focus(defer);
	},

	getValue: function() {
		var e = this.inputEl,
			v = e.getValue();
		e.dom.value = '';
		return v;
	},

	disable: function() {
		this.callParent(arguments);
		if (this.inputEl) {
			this.inputEl.set({disabled: true});
		}
	},

	enable: function() {
		this.callParent(arguments);
		if (this.inputEl) {
			this.inputEl.dom.removeAttribute('disabled');
		}
	},

	addWhiteboard: function() {
		this.ChatActions.sendWhiteboard(this, this.replyTo, this.chanel, this.recipients);
	}
});
