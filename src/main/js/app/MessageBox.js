export default Ext.define('NextThought.app.MessageBox', {
	extend: 'NextThought.common.window.Window',

	mixins: {
		State: 'NextThought.mixins.State'
	},

	state_key: 'MessageBox',

	ui: 'nti-alert',
	cls: 'nti-alert',

	constrainTo: Ext.getBody(),
	floating: true,
	dialog: true,
	resizable: false,
	closeAction: 'hide',

	aspectRatio: 1.78,

	height: 'auto',
	width: 400,

	layout: 'auto',
	componentLayout: 'natural',
	isOverlay: false,

	statics: {
		OK: 1,
		YES: 2,
		NO: 4,
		CANCEL: 8,
		OKCANCEL: 9,
		YESNO: 6,
		YESNOCANCEL: 14,
		INFO: 'info',
		WARNING: 'warning-red',
		QUESTION: 'question',
		ERROR: 'error',

		alert: function() {
			this.show.apply(this, arguments);
		},

		show: function() {
			this.SHARED_INSTANCE = this.SHARED_INSTANCE || this.create();

			this.SHARED_INSTANCE.show.apply(this.SHARED_INSTANCE, arguments);
		}
	},

	//Legacy Constants taken from Ext.window.MessageBox
	OK: 1,
	YES: 2,
	NO: 4,
	CANCEL: 8,
	OKCANCEL: 9,
	YESNO: 6,
	YESNOCANCEL: 14,
	INFO: 'info',
	WARNING: 'warning-red',
	QUESTION: 'question',
	ERROR: 'error',

	layout: 'none',

	items: [],

	childEls: ['body'],
	getTargetEl: function() {
		return this.body;
	},


	getDockedItems: function() {
		return [];
	},

	buttonOrder: ['primary', 'secondary'],


	defaultButtons: {
		primary: true
	},

	renderTpl: Ext.DomHelper.markup([
		{cls: 'alert-container', cn: [
			{cls: 'close'},
			{cls: 'message-container', cn: [
				{cls: 'title', html: 'Attention...'},
				{cls: 'message', html: ''}
			]},
			{
				id: '{id}-body', cls: 'button-body', html: '{%this.renderContainer(out,values)%}'
			}
		]}
	]),

	renderSelectors: {
		closeEl: '.close',
		messageContainerEl: '.message-container',
		titleEl: '.message-container .title',
		messageEl: '.message-container .message',
		buttonEl: '.button-body'
	},

	initComponent: function() {
		this.callParent(arguments);

		this.buttonText = {
			primary: getString('NextThought.view.MessageBox.ok'),
			secondary: getString('NextThought.view.MessageBox.cancel')
		};

		this.DO_NOT_SHOW = this.getCurrentState() || {};

		//make the execution of show take place in the next event loop
		this.show = Ext.Function.createBuffered(this.show, 1);
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.el, 'click', 'handleClick', this);
	},


	applyState: function() {},


	startClose: function() {
		this.addCls('closing');
		this.removeCls('showing');

		wait(500).then(this.close.bind(this));
	},


	handleClick: function(e) {
		//if we aren't closable then there is no need to check the others
		if (!this.isClosable) {
			return;
		}
		//if they clicked the x
		if (e.getTarget('.close')) {
			this.startClose();
		//if they clicked the mask
		} else if (!e.getTarget('.alert-container')) {
			this.startClose();
		}
	},


	parseButtons: function(cfg) {
		var btns = cfg.buttons,
			btnCfg = {}, i, text, order,
			lookUp = ['ok', 'yes', 'no', 'cancel'],
			buttonText = cfg.buttonText || {};

		for (i = 0; i < 4; i++) {
			if (btns & Math.pow(2, i)) {
				text = buttonText[lookUp[i]];
				order = i < 2 ? 'primary' : 'secondary';

				text = text ? text.split(':') : [];

				btnCfg[order] = {
					text: text.length === 1 ? text[0] : text[1],
					cls: text.length > 1 ? text[0] : '',
					name: lookUp[i]
				};
			}
		}

		return btnCfg;
	},


	getButtons: function(cfg) {
		var btns = cfg.buttons;

		if (!btns) {
			return this.defaultButtons;
		}

		if (Ext.isString(btns)) {
			return {
				primary: btns
			};
		}

		if (!Ext.isNumber(btns)) {
			return btns;
		}


		return this.parseButtons(cfg);
	},


	__maybeDoNotShowAgain: function(cfg) {
		var key = cfg.doNotShowAgainKey;

		return key && this.DO_NOT_SHOW[key];
	},


	doNotShowAgain: function(cfg) {
		var primaryHandler = cfg.buttons && cfg.buttons.primary && cfg.buttons.primary.handler;

		if (primaryHandler) {
			primaryHandler.call();
		}
	},


	alert: function(cfg) {
		this.show(cfg);
	},


	show: function(cfg) {
		if (!this.rendered) {
			this.render(Ext.getBody());
		}

		if (this.__maybeDoNotShowAgain(cfg)) {
			this.doNotShowAgain(cfg);
			return;
		}

		var me = this,
			buttons = this.getButtons(cfg);

		me.__clearPreviousConfig();

		me.currentConfig = cfg;

		me.titleEl.update(cfg.title || 'Attention...');
		me.messageEl.update(cfg.msg);

		if (cfg.icon) {
			me.messageContainerEl.addCls(cfg.icon);
		}

		//if we are closable show the x at the top
		if (cfg.closable !== false) {
			me.addCls('closable');
			me.isClosable = true;
		} else {
			me.removeCls('closable');
			me.isClosable = false;
		}

		if (cfg.doNotShowAgainKey) {
			me.addDoNotShowAgain(cfg);
		} else {
			delete this.doNotShowCheckbox;
		}

		me.buttonOrder.forEach(function(btn) {
			var btnCfg = buttons[btn];

			if (btnCfg) {
				me.addButton(btn, buttons[btn], cfg.fn, cfg);
			}
		});

		wait().then(function() {
			me.adjustSize();
		});

		me.callParent(arguments);
		me.toFront();
		me.addCls('showing');
	},


	adjustSize: function() {
		var height = this.getHeight(),
			aspect = this.aspectRatio,
			width = height * aspect;

		this.setWidth(400);

		while (this.buttonEl.dom.scrollHeight > 40) {
			width += 20;
			this.setWidth(width);
		}
	},


	__clearPreviousConfig: function() {
		var current = this.currentConfig;

		if (current) {
			//remove the last icon class
			this.messageContainerEl.removeCls(current.icon || '');
			//remove the buttons
			this.removeAll(true);
		}
	},


	getDoNotShowAgainCheckState: function() {
		if (!this.doNotShowCheckbox) { return false; }

		var dom = this.doNotShowCheckbox && this.doNotShowCheckbox.el && this.doNotShowCheckbox.el.dom,
			input = dom && dom.querySelector('input');

		return input && input.checked;
	},


	addDoNotShowAgain: function(config) {
		this.doNotShowCheckbox = this.add({
			xtype: 'box',
			autoEl: {
				tag: 'label',
				cls: 'do-not-show',
				cn: [
					{tag: 'input', type: 'checkbox', name: 'do-not-show'},
					{tag: 'span', html: 'Don\'t show again.'}
				]
			}
		});
	},


	addButton: function(name, cfg, closeHandler, alertConfig) {
		var me = this,
			cls = 'button ' + name;

		if (cfg === true) {
			cfg = {};
		} else if (Ext.isString(cfg)) {
			cfg = {
				text: cfg
			};
		}

		cfg.text = cfg.text || this.buttonText[name];

		if (cfg.cls) {
			cls += ' ' + cfg.cls;
		}

		this.add({
			xtype: 'box',
			ui: 'nti-button',
			cls: 'button',
			autoEl: {cls: cls, html: cfg.text},
			listeners: {
				click: {
					element: 'el',
					fn: function() {
						if (!cfg.doNotClose) {
							me.startClose();

							if (closeHandler) {
								closeHandler.call(null, cfg.name || cfg.text);
							}
						}

						me.onClose(alertConfig);

						if (cfg.handler) {
							cfg.handler.call();
						}
					}
				}
			}
		});
	},


	onClose: function(cfg) {
		if (!cfg.doNotShowAgainKey) { return; }

		var checked = this.getDoNotShowAgainCheckState();

		if (checked) {
			this.DO_NOT_SHOW[cfg.doNotShowAgainKey] = true;
		} else {
			delete this.DO_NOT_SHOW[cfg.doNotShowAgainKey];
		}

		this.setState(this.DO_NOT_SHOW);
	}
}, function() {
	//This needs to be come lazy! create on first use, not at define time. (the current constructor seems to trigger an early Ext.isReady)
	Ext.MessageBox = Ext.Msg = NextThought.app.MessageBox;

	window.alert = function(cfg, fn) {
		Globals.removeLoaderSplash();

		if (!cfg || Ext.isString(cfg)) {
			cfg = { msg: cfg || 'No Message' };
		}

		Ext.applyIf(cfg, {
			fn: Ext.isFunction(fn) ? fn : undefined
		});
		Ext.MessageBox.alert(cfg);
	};
});
