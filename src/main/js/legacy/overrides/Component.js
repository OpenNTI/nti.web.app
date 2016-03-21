var Ext = require('extjs');

require('../mixins/Delegation');
require('../util/Promise');


module.exports = exports = Ext.define('NextThought.overrides.Component', {
	override: 'Ext.Component',

	constructor: function () {
		var me = this;

		me.shadow = false;

		me.onceRendered = new Promise(function (fulfill) {
			me.afterRender = Ext.Function.createSequence(me.afterRender, fulfill);
		}.bind(me));

		me.callParent(arguments);
		me.initDelegation();
		me.setNTTooltip();


		me.on('afterrender', function () {
			var maybeFireVisibilityChange = Ext.Function.createBuffered(this.maybeFireVisibilityChange, 100, this);

			function monitorCardChange (cmp, scope) {
				var next = cmp.up('{isOwnerLayout("card")}'),
					c = cmp.isOwnerLayout('card') ? cmp : next;

				scope = scope || cmp;

				if (c) {
					scope.mon(c, {
						//beforeactivate: '',
						//beforedeactivate: '',
						activate: maybeFireVisibilityChange,
						deactivate: maybeFireVisibilityChange,
						scope: scope
					});

					if (next) {
						monitorCardChange(next, scope);
					}
				}
			}

			monitorCardChange(me);
		});
	},

	maybeFireVisibilityChange: function () {
		var v = this.isVisible(true);
		if (v !== this.___visibility) {
			this.fireEvent('visibility-changed-' + (v ? 'visible' : 'hidden'), this);
			this.fireEvent('visibility-changed', v, this);
		}
		this.___visibility = v;
	},

	setNTTooltip: function () {
		if (!this.rendered) {
			this.on('afterrender', 'setNTTooltip', this, {single: true});
			return;
		}

		if (this.tooltip) {
			if (!Ext.isObject(this.tooltip) && Ext.QuickTips) {
				Ext.QuickTips.register({
					target: this.getEl().id,
					text: this.tooltip
				});
			}
			this.el.set({title: undefined});
		}
	},

	rtlSetLocalX: function (x) {
		var style = this.el.dom.style;
		style.left = 'auto';
		style.right = (x === null) ? 'auto' : x + 'px';
	},

	isOwnerLayout: function (type) {
		var o = this.ownerLayout;
		return o && o.type === type;
	},

	isLayout: function (type) {
		var o = this.layout;
		return o && o.type === type;
	}
},function () {
	Ext.Component.mixin('delegation', NextThought.mixins.Delegation);
});
