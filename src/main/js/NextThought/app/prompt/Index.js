Ext.define('NextThought.app.prompt.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.prompt-view',

	requires: [
		'NextThought.app.prompt.StateStore',
		'NextThought.app.prompt.components.Container'
	],

	cls: 'prompt-layer',

	layout: 'none',
	items: [],


	initComponent: function() {
		this.callParent(arguments);

		this.HTML_ELEMENT = document.getElementsByTagName('html')[0];

		this.promptStack = [];

		this.PromptStateStore = NextThought.app.prompt.StateStore.getInstance();

		this.mon(this.PromptStateStore, {
			'open-prompt': this.openPrompt.bind(this)
		});
	},


	addOpenCls: function() {
		if (this.HTML_ELEMENT) {
			this.HTML_ELEMENT.classList.add('prompt-open');
		}
	},


	removeOpenCls: function() {
		if (this.HTML_ELEMENT) {
			this.HTML_ELEMENT.classList.remove('prompt-open');
		}
	},


	openPrompt: function(cmp, type, fulfill, reject, data) {
		if (!cmp) {	return;	}

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
			onSubmit: function(value) {
				close();
				fulfill(value);
			},
			onCancel: function(reason) {
				close();
				reject(reason);
			}
		});

		this.promptStack.push(prompt);

		this.addOpenCls();
	},


	closePrompt: function(index) {
		var stack = this.promptStack,
			removeOpenCls = this.removeOpenCls.bind(this),
			prompt = stack.peek();

		function close() {
			prompt.destroy();
			stack.pop();

			if (stack.length === 0) {
				removeOpenCls();
			}
		}

		if (prompt.index !== index) {
			console.warn('Trying to close prompt that isnt on top');
			return;
		}

		if (prompt.allowCancel) {
			prompt.allowCancel()
				.then(close);
		} else {
			close();
		}
	}
});
