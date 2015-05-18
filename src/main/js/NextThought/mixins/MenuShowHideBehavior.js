Ext.define('NextThought.mixins.MenuShowHideBehavior', {

	constructor: function() {
		// iPad doesn't need/want these
		if (Ext.is.iPad) {
			return;
		}

		if (!this.isMenu) {
			//don't duplicate this logic
			this.getRefOwner = (function(original) {
				return function() {
					return this.parentMenu ||
						   this.ownerButton ||
						   original.apply(this, arguments);
				}; }(this.getRefOwner));

			Ext.menu.Manager.register(this);//if this is menu, this is a no-op, but just to be nice...
			this.on('destroy', function() {
				Ext.menu.Manager.unregister(this);
				if (this.el) {
					this.el.un(this.mouseMonitor);
				}
			}, this);
		}

		this.on({
			scope: this,
			destroy: 'stopShowHideTimers',
			mouseleave: 'startHide',
			mouseenter: 'stopHide',
			afterrender: function() {
				var el = this.el;
				if (this.isMenu) {return;}//don't duplicate this logic

				el.addCls('x-menu');

				this.mouseMonitor = el.monitorMouseLeave(100, function(e) {
					if (this.disabled) { return; }
					this.fireEvent('mouseleave', this, e); }, this);

				this.mon(el, {
					scope: this,
					mouseover: function(e) {
						if (this.disabled) { return; }
						if (!el.contains(e.getRelatedTarget())) { this.fireEvent('mouseenter', this, e); }
						this.fireEvent('mouseover', this, null, e);
					}
				});
			}
		});
	},


	startShow: function(el, align, offset) {
		this.stopHide();
		this.__showTimeout = Ext.defer(function() {
			try {
				if (el && Ext.fly(el).isVisible(true)) {
					this.showBy(el, align, offset);
				}
			} catch (e) {
				console.warn('Forgot to stop timout before destroying');
			}
		}, 400, this);
	},


	stopShow: function() {
		this.startHide();
		clearTimeout(this.__showTimeout);
	},


	startHide: function() {
		var me = this;
		me.stopHide();
		me.__leaveTimer = setTimeout(function() {
			me.hide();
		}, 500);
	},


	stopHide: function() {
		clearTimeout(this.__leaveTimer);
	},


	stopShowHideTimers: function() {
		clearTimeout(this.__leaveTimer);
		clearTimeout(this.__showTimeout);
	}
});
