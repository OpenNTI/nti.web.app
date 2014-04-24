Ext.define('NextThought.view.MessageBox', {
	extend: 'Ext.window.MessageBox',

	plain: true,
	border: false,
	frame: false,
	shadow: false,
	ui: 'nti-alert',
	cls: 'nti-alert',
	minWidth: 390,
	maxWidth: 500,

	CANCEL: 1,
	NO: 2,
	YES: 4,
	OK: 8,

	iconHeight: 75,
	iconWidth: 80,

	buttonText: {
		ok: 'OK',
		yes: 'Yes',
		no: 'No',
		cancel: 'Cancel'
	},

	buttonIds: [
		'cancel', 'no', 'yes', 'ok'
	],

	makeButton: function(btnIdx) {
		var btnId = this.buttonIds[btnIdx];

		return new Ext.button.Button({
			handler: this.btnCallback,
			itemId: btnId,
			ui: 'secondary',
			scale: 'large',
			scope: this,
			text: this.buttonText[btnId],

			xhooks: {
				//We support setting ui off a formatter in the text.
				//we split by ':' and if there are two parts the first
				//will be used to set the UI and the second will be the
				//text
				setText: function(text) {
					var parts = text.split(':') || [],
						newArgs = Array.prototype.slice.call(arguments);
					if (parts.length > 1) {
						this.setUI(parts[0]);
						newArgs[0] = parts[1];
						return this.callParent(newArgs);
					}

					//If there is no formatter do the same
					//magical stuff we used to do
					if (/delete/i.test(text) || /report/i.test(text)) {
						this.setUI('caution');
					}
					else if (/accept/i.test(text)) {
						this.setUI('primary');
					}
					else {
						this.setUI('secondary');
					}

					return this.callParent(arguments);
				}
			}
		});
	},


	initComponent: function() {
		this.callParent(arguments);
		this.bottomTb.layout.pack = 'end';
	},


	setTitle: function() { this.callParent(['&#160;']); },

	show: function(cfg) {
		Ext.applyIf(cfg, {
			title: 'Attention...'
		});


		function wrap(str, width, brk) {
			if (str.length > width) {
				var left, right, p = width;
				p = str.lastIndexOf(' ', p);
				if (p > 0) {
					left = str.substring(0, p);
					right = str.substring(p + 1);
					return left + brk + wrap(right, width, brk);
				}
			}
			return str;
		}

		cfg.msg = wrap(cfg.msg, 60, '\n');

		cfg.msg = cfg.title + '<div class="message">' + cfg.msg + '</div>';
		cfg.msg = cfg.msg.replace(/\n/, '<br/>');
		Ext.defer(this.toFront, 10, this);
		Ext.defer(this.updateLayout, 100, this);
		return this.callParent([cfg]);
	}

}, function() {
	Ext.MessageBox = Ext.Msg = new NextThought.view.MessageBox();
	window.alert = function(cfg, fn) {
		Globals.removeLoaderSplash();
		if (!cfg || Ext.isString(cfg)) {
      cfg = { msg: cfg || 'No Message' };
    }

		Ext.applyIf(cfg, {
			icon: Ext.Msg.WARNING,
			buttons: Ext.Msg.OK,
			fn: Ext.isFunction(fn) ? fn : undefined
		});
		Ext.MessageBox.alert(cfg);
	};
});
