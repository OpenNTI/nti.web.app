Ext.define( 'NextThought.view.Views', {
	extend: 'Ext.container.Container',
	alias: 'widget.main-views',
	requires: [
		'Ext.layout.container.Card',
		'NextThought.view.contacts.View',
		'NextThought.view.forums.View',
		'NextThought.view.library.View',
		'NextThought.view.profiles.View'
	],


	
	plain: true,
	border: false, 
	frame: false,
	layout: {
		type: 'card',
		deferredRender: true
	},
	activeItem: 0,
	defaults: {
		minWidth: 1024,
		maxWidth: 1165
	},
	items:[
		{id: 'profile', xtype: 'profile-view-container'},
		{id: 'library', xtype: 'library-view-container'},
		{id: 'forums', xtype: 'forums-view-container'},
		{id: 'contacts', xtype: 'contacts-view-container'}
	],

	childEls: ['tabs'],
	renderTpl: Ext.DomHelper.markup([
		{ cls: 'main-view-tabs tabs', id: '{id}-tabs' },
		'{%this.renderContainer(out,values)%}'
	]),

	tabTpl: new Ext.XTemplate(Ext.DomHelper.markup(
		{ tag: 'tpl', 'for':'.', cn:[
			{ cls:'main-view-tab {[values.selected?\'selected\':\'\']}', html: '{label}', 'data-view-id':'{viewId}'}
		]}
	)),


	afterRender: function(){
		this.callParent(arguments);

		var left = this.el.getPadding('l'),
			right = this.el.getPadding('r'),
			rightScale = right/left;

		this.tabs.setVisibilityMode(Ext.Element.DISPLAY);

		this.initialPadding = {
			left: left,
			right: right,
			scale: rightScale
		};

		this.on({
			'resize':'adjustPadding',
			'activate-view': 'onActivateView',
			'before-activate-view':'onBeforeActivateView'
		});

		this.mon(this.tabs,'click','onTabClicked');

		this.items.each(function(p){
			this.mon(p,{
				'update-tabs':'onViewChanged',
				'activate':'onViewChanged'
			});
		},this);
	},


	adjustPadding: function(){
		var w = this.el.getWidth(),
			ip = this.initialPadding,
			natural = ip.left + ip.right,
			minWidth = 1024,
			maxWidth = 1165,
			d = 0,
			lp = 0,
			rp = 0;

		function scale(delta){
			rp = Math.floor(delta / ip.scale);
			lp = (delta - rp)+'px';
			rp = rp+'px';
		}

		if(w > minWidth){
			d = w - minWidth;
			if(d >= natural){
				lp = undefined;
				rp = undefined;

				d = w - maxWidth;
				if(d >= natural){
					scale(d);
				}
			}
			else {
				scale(d);
			}
		}

		//if the tabs don't align correctly in other browsers, uncomment the line below. (it will force it)
		//this.tabs.setLocalX(parseInt(lp,10));
		this.el.setStyle({paddingLeft:lp, paddingRight: rp});
		this.updateLayout();
	},


	clearTabs: function(){
		this.tabs.update('');
		this.tabs.hide();
	},


	updateTabs: function(tabSpecs){
		this.clearTabs();

		if(!tabSpecs){ return; }

		this.tabTpl.overwrite(this.tabs,tabSpecs);
		this.tabs.show();
	},


	onTabClicked: function(e){
		var cmp = this.getActive(),
			t = e.getTarget('.main-view-tab',null,true),
			tab = {},
			vId = t && t.getAttribute('data-view-id');

		if(!cmp){
			console.error('We should not ever be here! no active view???');
			console.trace();
			return;
		}

		if(!t){
			return;
		}

		tab.viewId = vId;
		tab.label = t.getHTML();


		if(cmp.onTabClicked(tab) && !t.hasCls('.selected')){
			this.tabs.select('.main-view-tab').removeCls('selected');
			t.addCls('selected');
		}
	},


	onViewChanged: function(to, from){
		function getName(v){ return (v && v.id)||'null'; }
		console.debug('view changed to: '+getName(to)+', from: '+getName(from));

		this.updateTabs(to && to.getTabs && to.getTabs(),to);
	},

	
	getActive: function() {
		return this.getLayout().getActiveItem();
	},

	/**
	 *
	 * @param id
	 * @returns {boolean} True if the result of this means that the active view is the view that was asked for.
	 */
	onActivateView: function(id){
		var layout = this.getLayout(),
			activeItem = layout.getActiveItem(),
			view = Ext.getCmp(id);

		if(activeItem !== view){
			return view === layout.setActiveItem(id);
		}

		return true;
	},


	onBeforeActivateView: function(id){
		var layout = this.getLayout(),
			activeItem = layout.getActiveItem();

		return !activeItem || activeItem.fireEvent('beforedeactivate',activeItem,{});
	}
});
