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

		this.header = this.add({
			xtype: 'prompt-header',
			doCancel: this.doCancel.bind(this),
			doBack: this.doBack.bind(this)
		});

		this.bodyContainer = this.add({
			xtype: 'container',
			cls: 'body-container',
			layout: 'none',
			items: []
		});

		this.footer = this.add({
			xtype: 'prompt-footer',
			doSave: this.doSave.bind(this),
			doCancel: this.doCancel.bind(this)
		});

		this.bodyCmp = this.cmp.create(this.getBodyConfig());

		this.bodyContainer.add(this.bodyCmp);

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
				doClose: this.doCancel.bind(this),
				Header: {
					enableBack: this.header.enableBack.bind(this.header),
					disableBack: this.header.disableBack.bind(this.header),
					setTitle: this.header.setTitle.bind(this.header),
					setSubTitle: this.header.setSubTitle.bind(this.header),
					showError: this.header.showError.bind(this.header),
					showWarning: this.header.showWarning.bind(this.header),
					showMessage: this.header.showMessage.bind(this.header)
				},
				Footer: {
					enableSave: this.footer.enableSave.bind(this.footer),
					disableSave: this.footer.disableSave.bind(this.footer),
					setSaveText: this.footer.setSaveText.bind(this.footer),
					setCancelText: this.footer.setCancelText.bind(this.footer)
				}
			}
		};

	},


	doBack: function() {
		if (this.bodyCmp.onBack) {
			this.bodyCmp.onBack();
		}
	},


	onSaveSuccess: function(value) {
		if (this.onSubmit) {
			this.onSubmit(value);
		}
	},


	onSaveFailure: function(reason) {
		this.header.showError(reason);
	},


	__validate: function() {
		if (this.bodyCmp.doValidation) {
			return this.bodyCmp.doValidation();
		}

		return Promise.resolve();
	},


	__save: function() {
		if (this.bodyCmp.onSave) {
			this.bodyCmp.onSave()
				.then(this.onSaveSuccess.bind(this))
				.fail(this.onSaveFailure.bind(this));
		}
	},


	doSave: function() {
		this.__validate()
			.then(this.__save.bind(this));
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
