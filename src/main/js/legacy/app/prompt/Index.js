const Ext = require('@nti/extjs');
const Commons = require('@nti/web-commons');

const PromptStateStore = require('./StateStore');

require('./components/Container');

module.exports = exports = Ext.define('NextThought.app.prompt.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.prompt-view',
	cls: 'prompt-layer',
	layout: 'none',
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		this.HTML_ELEMENT = document.getElementsByTagName('html')[0];

		this.promptStack = [];

		this.PromptStateStore = PromptStateStore.getInstance();

		this.mon(this.PromptStateStore, {
			'open-prompt': this.openPrompt.bind(this),
		});
	},

	addOpenCls: function () {
		if (this.HTML_ELEMENT) {
			this.HTML_ELEMENT.classList.add('prompt-open');
			Commons.Prompt.Manager.suspendEscapeListener();
		}
	},

	removeOpenCls: function () {
		if (this.HTML_ELEMENT) {
			this.HTML_ELEMENT.classList.remove('prompt-open');
			Commons.Prompt.Manager.resumeEscapeListener();
		}
	},

	addStackClasses: function () {
		var stack = this.promptStack,
			lastIndex = stack.length - 1;

		stack.forEach(function (prompt, index) {
			if (index < lastIndex) {
				prompt.onCovered();
			} else {
				prompt.onUncovered();
			}
		});
	},

	openPrompt: function (cmp, type, fulfill, reject, data) {
		if (!cmp) {
			return;
		}

		var index = this.promptStack.length,
			close = this.closePrompt.bind(this, index),
			prompt;

		prompt = this.add({
			xtype: 'prompt-container',
			index: index,
			promptType: type,
			scrollingParent: this.el,
			cmp: cmp,
			data: data,
			hidden: data && data.auto,
			hideMode: 'visibility',
			onSubmit: function (value) {
				close().then(function () {
					fulfill(value);
				});
			},
			onCancel: function (reason) {
				close().then(function () {
					reject(reason);
				});
			},
		});

		this.promptStack.push(prompt);

		this.addOpenCls();
		this.addStackClasses();
		Ext.getBody().appendChild(this.el);
	},

	closePrompt: function (index) {
		var stack = this.promptStack,
			removeOpenCls = this.removeOpenCls.bind(this),
			addStackClasses = this.addStackClasses.bind(this),
			prompt = stack.peek(),
			allow;

		function close() {
			prompt.destroy();
			stack.pop();

			if (stack.length === 0) {
				removeOpenCls();
			} else {
				addStackClasses();
			}
		}

		if (prompt.index !== index) {
			console.warn('Trying to close prompt that isnt on top');
			return;
		}

		if (prompt.allowCancel) {
			allow = prompt.allowCancel();
		} else {
			allow = Promise.resolve();
		}

		return allow.then(close);
	},
});
