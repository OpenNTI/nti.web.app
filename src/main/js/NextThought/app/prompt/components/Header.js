Ext.define('NextThought.app.prompt.components.Header', {
	extend: 'Ext.Component',
	alias: 'widget.prompt-header',

	cls: 'prompt-header',


	renderTpl: Ext.DomHelper.markup([
		{cls: 'back'},
		{cls: 'title', cn: [
			{cls: 'main'},
			{cls: 'sub'}
		]},
		{cls: 'close', cn: [
			{cls: 'icon'}
		]}
	]),


	renderSelectors: {
		backEl: '.back',
		mainTitleEl: '.title .main',
		subTitleEl: '.title .sub',
		closeEl: '.close .icon'
	},


	afterRender: function() {
		this.callParent(arguments);

		if (this.backLabel) {
			this.enableBack(this.backLabel);
		} else {
			this.disableBack();
		}

		if (this.title) {
			this.setTitle(this.title);
		}

		if (this.subTitle) {
			this.setSubTitle(this.subTitle);
		}

		this.mon(this.el, 'click', this.handleClick.bind(this));
	},


	enableBack: function(title) {
		if (!this.rendered) {
			this.backLabel = title;
			return;
		}

		this.backEl.update(title || '');
		this.removeCls('back-disabled');
	},


	disableBack: function() {
		if (!this.rendered) {
			delete this.backLabel;
			return;
		}

		this.backEl.update('');
		this.addCls('back-disabled');
	},


	setTitle: function(title) {
		if (!this.rendered) {
			this.title = title;
			return;
		}

		this.mainTitleEl.update(title || '');
	},


	setSubTitle: function(subTitle) {
		if (!this.rendered) {
			this.subTitle = subTitle;
			return;
		}

		this.subTitleEl.update(subTitle || '');
	},


	handleClick: function(e) {
		if (e.getTarget('.disabled')) { return; }

		if (e.getTarget('.back')) {
			this.onBack();
		} else if (e.getTarget('.close') && e.getTarget('.icon')) {
			this.onClose();
		}
	},


	onBack: function() {
		if (this.doBack) {
			this.doBack();
		}
	},


	onClose: function() {
		if (this.doCancel) {
			this.doCancel();
		}
	}
});
