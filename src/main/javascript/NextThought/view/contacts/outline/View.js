Ext.define('NextThought.view.contacts.outline.View', {
	extend: 'Ext.view.View',
	alias:  'widget.contacts-outline',

	ui:                      'nav',
	preserveScrollOnRefresh: true,

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', cn: [
			'{outlineLabel}'
		]},
		{ cls: 'outline-list'},
		{ tag:'tpl', 'if':'buttons', cn: { cls:'buttons', cn: [
			{ tag:'tpl', 'if':'canjoin', cn:{
				cls: 'join join-{type} contact-button', html: 'Join {type:capitalize}' } },
			{ tag:'tpl', 'if':'cancreate', cn:{
				cls: 'create create-{type} contact-button', html: 'Create {type:capitalize}' } }
		]}}
	]),

	renderSelectors: {
		frameBodyEl: '.outline-list',
		buttonsEl: '.buttons'
	},


	getTargetEl: function () {
		return this.frameBodyEl;
	},


	config: {
		outlineLabel: '--'
	},


	overItemCls:  'over',
	itemSelector: '.outline-row',
	tpl:          Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [

		{
			cls: 'outline-row {type}', 'data-qtip': '{displayName}',
			cn:  [
				{ cls: 'label', html: '{displayName}' }
			]
		}

	]}),


	initComponent: function(){
		this.callParent(arguments);
		this.addCls('nav-outline make-white');
	},


	beforeRender: function () {
		this.callParent();
		var me = this, s = this.getSelectionModel();
		s.onNavKey = Ext.Function.createInterceptor(s.onNavKey, function () {
			me.fromKey = true;
		});

		this.renderData = Ext.apply(this.renderData || {}, {
			outlineLabel: this.getOutlineLabel(),
			buttons: Boolean(this.subType!=='contact'),
			type: this.subType,
			cancreate: true,//capability?
			canjoin: this.subType === 'group'
		});

		this.on({
					scope:        this,
					itemclick:    function () {
						this.fromClick = true;
					},
					beforeselect: function (s, r) {
						var pass = r.data.type !== 'unit',
								store = s.getStore(),
								last = s.lastSelected || store.first(), next;

						if (this.fromKey && !pass) {
							last = store.indexOf(last);
							next = store.indexOf(r);
							next += ((next - last) || 1);

							//do this in the next event pump
							Ext.defer(s.select, 1, s, [next]);
						}
						return pass;

					},
					select:       function (s, r) {
						if (this.fromClick || this.fromKey) {
							console.debug('do something with selection');
							this.fireEvent('contact-row-selected',r);
						}
						delete this.fromClick;
						delete this.fromKey;

						s.deselect(r);
					}
				});
	},


	afterRender: function () {
		this.callParent(arguments);

		if( this.buttonsEl ){
			this.mon(this.buttonsEl,'click','onButtonsClicked');
		}


		if (Ext.is.iPad) {
			// Absorb event for scrolling
			this.getEl().swallowEvent('touchmove');
		}
	},


	onButtonsClicked: function(evt){
		var b = evt.getTarget('.contact-button');
		if( b ){
			this.fireEvent('contact-button-clicked', b, this);
		}
	},


	clear: function () {
		this.bindStore('ext-empty-store');
	}
});
