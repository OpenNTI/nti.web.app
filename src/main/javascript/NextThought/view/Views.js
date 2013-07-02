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
	items:[
		{id: 'profile', xtype: 'profile-view-container'},
		{id: 'library', xtype: 'library-view-container'},
		{id: 'forums', xtype: 'forums-view-container'},
		{id: 'contacts', xtype: 'contacts-view-container'}
	],


	afterRender: function(){
		this.callParent(arguments);

		var left = this.el.getPadding('l'),
			right = this.el.getPadding('r'),
			rightScale = right/left;

		this.initialPadding = {
			left: left,
			right: right,
			scale: rightScale
		};

		this.on({
			resize:'adjustPadding',
			'activate-view': 'onActivateView',
			'before-activate-view':'onBeforeActivateView',
			scope:this
		});
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

		this.el.setStyle({paddingLeft:lp, paddingRight: rp});
		this.updateLayout();
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
