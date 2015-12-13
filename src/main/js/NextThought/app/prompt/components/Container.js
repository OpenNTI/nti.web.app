Ext.define('NextThought.app.prompt.components.Container', {
	extend: 'Ext.container.Container',
	alias: 'widget.prompt-container',

	requires: [
		'NextThought.app.prompt.components.Header',
		'NextThought.app.prompt.components.Footer'
	],

	cls: 'prompt-container',

	layout: 'none',
	items: [],


	initComponent: function() {
		this.callParent(arguments);

		this.onWindowResize = this.onWindowResize.bind(this);

		this.bodyCmp = this.cmp.create(this.getBodyConfig());

		this.header = this.add({
			xtype: 'prompt-header',
			doCancel: this.doCancel.bind(this),
			doBack: this.doBack.bind(this)
		});

		this.bodyContainer = this.add({
			xtype: 'container',
			cls: 'body-container',
			layout: 'none',
			items: [this.bodyCmp]
		});

		this.footer = this.add({
			xtype: 'prompt-footer',
			doSave: this.doSave.bind(this),
			doCancel: this.doCancel.bind(this)
		});

		this.isSetUp = true;
		this.fireEvent('setup-complete');
	},


	onWindowResize: function() {
		this.center();
	},


	getBodyConfig: function() {
		return {
			Prompt: {
				data: this.data,
				type: this.promptType,
				Header: {
					enableBack: this.enableBack.bind(this),
					disableBack: this.disableBack.bind(this),
					setTitle: this.setTitle.bind(this),
					setSubTitle: this.setSubTitle.bind(this)
				},
				Footer: {
					enableSave: this.enableSave.bind(this),
					disableSave: this.disableSave.bind(this),
					setSaveText: this.setSaveText.bind(this),
					setCancelText: this.setCancelText.bind(this)
				}
			}
		};

	},


	enableBack: function(text) {
		if (!this.isSetUp) {
			this.on('setup-complete', this.enableBack.bind(this, text));
			return;
		}

		this.header.enableBack(text);
	},


	disableBack: function() {
		if (!this.isSetUp) {
			this.on('setup-complete', this.disableBack.bind(this));
			return;
		}

		this.header.disableBack();
	},


	setTitle: function(title) {
		if (!this.isSetUp) {
			this.on('setup-complete', this.setTitle.bind(this, title));
			return;
		}

		this.header.setTitle(title);
	},


	setSubTitle: function(subTitle) {
		if (!this.isSetUp) {
			this.on('setup-complete', this.setSubTitle.bind(this, subTitle));
			return;
		}

		this.header.setSubTitle(subTitle);
	},


	enableSave: function() {
		if (!this.isSetUp) {
			this.on('setup-complete', this.enablesave.bind(this));
			return;
		}

		this.footer.enableSave();
	},


	disableSave: function() {
		if (!this.isSetUp) {
			this.on('setup-complete', this.disableSave.bind(this));
			return;
		}

		this.footer.disableSave();
	},


	setSaveText: function(text) {
		if (!this.isSetUp) {
			this.on('setup-complete', this.setSaveText.bind(this, text));
			return;
		}

		this.footer.setSaveText(text);
	},


	setCancelText: function(text) {
		if (!this.isSetUp) {
			this.on('setup-complete', this.setCancelText.bind(this, text));
			return;
		}

		this.footer.setCancelText(text);
	},


	doBack: function() {
		if (this.bodyCmp.onBack) {
			this.bodyCmp.onBack();
		}
	},


	doSave: function() {
		if (this.bodyCmp.onSave) {
			this.bodyCmp.onSave();
		}
	},


	allowCancel: function() {
		if (this.bodyCmp.allowCancel) {
			return this.bodyCmp.allowCancel();
		}

		return Promise.resolve();
	},


	doCancel: function() {
		this.onCancel();
	}
});
