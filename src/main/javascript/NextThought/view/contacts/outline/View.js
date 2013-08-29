Ext.define('NextThought.view.contacts.outline.View', {
	extend: 'Ext.view.View',
	alias:  'widget.contacts-outline',

	ui:                      'nav',
	cls:                     'nav-outline make-white',
	preserveScrollOnRefresh: true,

	renderTpl: Ext.DomHelper.markup([
										{ cls: 'header', cn: [
											'{outlineLabel}'
										]},
										{ cls: 'outline-list'}
									]),

	renderSelectors: {
		frameBodyEl: '.outline-list'
	},


	getTargetEl: function () {
		return this.frameBodyEl;
	},


	config: {
		outlineLabel: '--'
	},


	overItemCls:  'over',
	itemSelector: '.outline-row',
	tpl:          new Ext.XTemplate(Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [

		{
			cls: 'outline-row {type}', 'data-qtip': '{displayName}',
			cn:  [
				{ cls: 'label', html: '{displayName}' }
			]
		}

	]})),


	beforeRender: function () {
		this.callParent();
		var me = this, s = this.getSelectionModel();
		s.onNavKey = Ext.Function.createInterceptor(s.onNavKey, function () {
			me.fromKey = true;
		});

		this.renderData = Ext.apply(this.renderData || {}, {
			outlineLabel: this.getOutlineLabel()
		});

		this.on({
					scope:        this,
					itemclick:    function () {
						this.fromClick = true;
					},
					beforeselect: function (s, r) {
						var pass = r.get('type') !== 'unit',
								store = s.getStore(),
								last = s.lastSelected || store.first(), next;

						if (this.fromKey && !pass) {
							last = store.indexOf(last);
							next = store.indexOf(r);
							next += ((next - last) || 1);

							//do the in the next event pump
							Ext.defer(s.select, 1, s, [next]);
						}
						return pass;

					},
					select:       function (s, r) {
						if (this.fromClick || this.fromKey) {
							console.debug('do something with selection');
						}
						delete this.fromClick;
						delete this.fromKey;
					}
				});
	},


	afterRender: function () {
		this.callParent(arguments);

		if (Ext.is.iPad) {
			// Absorb event for scrolling
			this.getEl().dom.addEventListener('touchmove', function (e) {
				e.stopPropagation();
			});
		}
	},


	clear: function () {
		this.bindStore('ext-empty-store');
	}
});
