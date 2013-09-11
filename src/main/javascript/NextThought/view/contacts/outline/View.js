Ext.define('NextThought.view.contacts.outline.View', {
	extend: 'Ext.view.View',
	alias:  'widget.contacts-outline',

	ui:                      'nav',
	preserveScrollOnRefresh: true,

	requires: [
		'NextThought.view.contacts.outline.search.View'
	],

	mixins:{
		contactSearching: 'NextThought.view.contacts.outline.search.ContactSearchMixin'
	},

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', cn: [
			'{outlineLabel}'
		]},
		{ cls: 'outline-list scrollable'},
		{ tag:'tpl', 'if':'buttons', cn: { cls:'buttons', cn: [
			{ tag:'tpl', 'if':'canjoin', cn:{
				cls: 'join join-{type} contact-button', html: 'Join {type:capitalize}' } },
			{ tag:'tpl', 'if':'cancreate', cn:{
				cls: 'create create-{type} contact-button', html: 'Create {type:capitalize}' } },
			{ tag:'tpl', 'if':'hasSearch', cn:{
				cls: 'contact-button search', html: 'Search', cn: [
					{tag: 'input', type: 'text'},
					{cls: 'clear', style: {display: 'none'}}
				]}
			}
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
		if(this.subType === 'contact'){
			this.mixins.contactSearching.constructor.apply(this, arguments);
		}
	},


	beforeRender: function () {
		this.callParent();
		var me = this, s = this.getSelectionModel();
		s.onNavKey = Ext.Function.createInterceptor(s.onNavKey, function () {
			me.fromKey = true;
		});

		// TODO: We should really create subclasses of this view where we set the correct flags and overrides
		// rather than checking if the subType is so and so.
		this.renderData = Ext.apply(this.renderData || {}, {
			outlineLabel: this.getOutlineLabel(),
			buttons: true,
			type: this.subType,
			cancreate:  this.subType !== 'contact',//capability?
			canjoin: this.subType === 'group',
			hasSearch: this.subType === 'contact'
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
	},


	onButtonsClicked: function(evt){
		var b = evt.getTarget('.contact-button');
		if( b && !Ext.fly(b).hasCls('search')){
			this.fireEvent('contact-button-clicked', b, this);
		}
	},


	clear: function () {
		this.bindStore('ext-empty-store');
	}
});
