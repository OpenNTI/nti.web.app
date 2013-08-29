Ext.define('NextThought.view.tool.Action', {
	extend: 'Ext.Component',
	alias:  'widget.nti-tool-action',

	ui:          'nti-tool-action',
	cls:         'nti-tool-action',
	disabledCls: 'disabled',

	renderTpl: Ext.DomHelper.markup([
										{cls: 'icon {iconCls}'},
										{cls: 'label', html: '{label}'}
									]),

	renderSelectors: {
		iconEl: '.icon',
		textEl: '.label'
	},

	constructor: function (config) {
		var action;
		if (config && config.action) {
			action = config.action;
			delete config.action;
		}
		this.callParent([config]);
		this.assignExtAction(action);
	},


	beforeRender: function () {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			iconCls: this.iconCls || 'defualt',
			label:   this.label || ''
		});
	},


	afterRender: function () {
		var me = this, el = me.el, c = 'over';
		me.callParent(arguments);
		me.mon(el, 'click', me.click, me);
		el.hover(function () {
			el.addCls(c);
		}, function () {
			el.removeCls(c);
		});
	},


	click:      function (e, dom) {
		function stop() {
			e.stopEvent();
			return false;
		}

		if (this.disabled) {
			return stop();
		}

		if (this.extAction) {
			try {
				this.extAction.execute(e);
			}
			catch (actionError) {
				console.error('There was an error performing the assigned action, the event chain is now stopping',
							  Globals.getError(actionError));
				return stop();
			}
		}

		if (this.handler) {
			//if defined, allow the handler to prevent the click event.
			if (this.handler.call(this.scope || this, this) === false) {
				return stop();
			}
		}

		if (this.fireEvent('click', e, this) === false) {
			return stop();
		}

		return true;
	},


	//Ext.Action might call on these, and we don't want to die or change ourself...so map emptyFn
	setHandler: Ext.emptyFn,
	setText:    Ext.emptyFn,
	setIconCls: Ext.emptyFn,

	assignExtAction: function (action) {
		var old = this.extAction;
		this.extAction = action && action.isAction ? action : undefined;
		if (this.extAction) {
			action.addComponent(this);
			this.setDisabled(action.isDisabled());
		}
		else {
			delete this.extAction;
		}
		if (old) {
			old.removeComponent(this);
		}
	}
});
