Ext.define('NextThought.view.Views', {
	extend: 'Ext.container.Container',
	alias: 'widget.main-views',
	requires: [
		'Ext.layout.container.Card',
		'NextThought.view.contacts.View',
		'NextThought.view.content.View',
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
	items: [
		{id: 'profile', xtype: 'profile-view-container', associatedParent: 'contacts'},
		{id: 'library', xtype: 'library-view-container'},
		{id: 'content', xtype: 'content-view-container'},
		{id: 'forums', xtype: 'forums-view-container'},
		{id: 'contacts', xtype: 'contacts-view-container'}
	],

	childEls: ['tabs'],
	renderTpl: Ext.DomHelper.markup([
		{ cls: 'main-view-tabs tabs', id: '{id}-tabs' },
		'{%this.renderContainer(out,values)%}'
	]),

	tabTpl: new Ext.XTemplate(Ext.DomHelper.markup(
			{ tag: 'tpl', 'for': '.', cn: [
				{ cls: 'main-view-tab {[values.selected?\'selected\':\'\']}', html: '{label}', 'data-view-id': '{viewId}'}
			]}
	)),


	listeners: {
		'new-background': 'updateBackground'
	},


	updateBackground: function(newUrl) {
		if (!this.el) {
			return;
		}

		if (newUrl && newUrl.indexOf('//') === 0) {
			newUrl = location.protocol + newUrl;
		}

		var HOST = Globals.HOST_PREFIX_PATTERN,
				currentURL = this.el.getStyle('background-image').slice(4, -1),
				a = HOST.exec(newUrl),
				b = HOST.exec(currentURL),
				d = HOST.exec(location)[0];//default host

		a = (a && a[0]) || d;
		b = (b && b[0]) || d;

		currentURL = currentURL.replace(HOST, '') === (newUrl || '').replace(HOST, '');

		if (!currentURL || a !== b) {
			newUrl = (!Ext.isEmpty(newUrl) && 'url(' + newUrl + ')') || null;
			this.el.setStyle({backgroundImage: newUrl});
		}
	},


	afterRender: function() {
		if (Ext.is.iPad) {
			Ext.apply(this, { minHeight: 615 });
		}

		this.callParent(arguments);

		this.nav = Ext.get('nav');
		var left = this.el.getPadding('l'),
				right = this.el.getPadding('r'),
				rightScale = right / left;

		this.tabs.setVisibilityMode(Ext.Element.DISPLAY);

		this.initialPadding = {
			left: left,
			right: right,
			scale: rightScale
		};

		this.on({
			'resize': 'adjustPadding',
			'activate-view': 'onActivateView',
			'before-activate-view': 'onBeforeActivateView'
		});

		this.mon(this.tabs, 'click', 'onTabClicked');

		this.items.each(function(p) {
			this.mon(p, {
				'update-tabs': 'onViewChanged',
				'activate': 'onViewChanged'
			});
		}, this);
	},


	adjustPadding: function() {
		var w = this.el.getWidth(),
				ip = this.initialPadding,
				natural = ip.left + ip.right,
				minWidth = 1024,
				maxWidth = 1024,
				d = 0,
				lp = 0,
				rp = 0;

		function scale(delta) {
			rp = Math.floor(delta / ip.scale);
			lp = (delta - rp) + 'px';
			rp = rp + 'px';
		}

		if (w > minWidth) {
			d = w - minWidth;
			if (d >= natural) {
				lp = undefined;
				rp = undefined;

				d = w - maxWidth;
				if (d >= natural) {
					scale(d);
				}
			}
			else {
				scale(d);
			}
		}

		//if the tabs don't align correctly in other browsers, uncomment the line below. (it will force it)
		//this.tabs.setLocalX(parseInt(lp,10));
		this.el.setStyle({paddingLeft: lp, paddingRight: rp});
		this.nav.setStyle({paddingLeft: lp});
		this.updateLayout();
	},


	clearTabs: function() {
		Ext.destroy(this.tabMonitors || []);
		delete this.tabMonitors;
		this.tabs.update('');
		this.tabs.hide();
		this.removeCls('has-alt-tabbar');//TODO: unify this some how.
	},


	updateTabs: function(tabSpecs) {
		var me = this, idRe = /^([^?]*)\??$/;

		me.clearTabs();
		if (!tabSpecs) {
			return;
		}

		me.tabTpl.overwrite(me.tabs, tabSpecs);
		me.tabs.show();

		me.tabMonitors = [];
		Ext.each(tabSpecs, function(s) {
			var id = (idRe.exec(s.viewId) || [])[1],
				cmp = id && (Ext.getCmp(id) || me.getActive().getComponent(id));
			if (cmp) {
				me.tabMonitors.push(me.mon(cmp, {
					activate: 'onTabActivated',
					notify: 'onViewNotifiy',
					destroyable: true
				}));
				me.onViewNotifiy(cmp, cmp.notifications);
			} else if (id) {
				console.warn('No component found for:', id);
			}
		});
	},


	getTabFromView: function(view) {
		var a = this.getActive(),
			id = view && view[(a && a.viewIdProperty) || 'id'],
			t = id && this.tabs,
			s = '.main-view-tab[data-view-id="{0}"]';
		return t && (t.down(Ext.String.format(s, id)) || t.down(Ext.String.format(s, id + '?')));
	},


	onViewNotifiy: function(tabView, count) {
		var tab = this.getTabFromView(tabView);
		if (tab) {
			tab.set({'data-badge': count || undefined});
		}
	},


	onTabActivated: function(tabView) {
		var tab = this.getTabFromView(tabView);
		this.tabs.select('.main-view-tab').removeCls('selected');
		if (tab) {
			tab.addCls('selected');
		}
	},


	onTabClicked: function(e) {
		var cmp = this.getActive(),
				t = e.getTarget('.main-view-tab', null, true),
				tab = {},
				vId = t && t.getAttribute('data-view-id');

		if (!cmp) {
			console.error('We should not ever be here! no active view???');
			return;
		}

		if (!t) {
			return;
		}

		tab.viewId = vId;
		tab.label = t.getHTML();

		cmp.onTabClicked(tab);
	},


	onViewChanged: function(to, from) {
		if (from && from.extraTabBarCls) {
			this.tabs.removeCls(from.extraTabBarCls);
		}
		if (to && to.extraTabBarCls) {
			this.tabs.addCls(to.extraTabBarCls);
		}

		this.updateTabs(to && to.getTabs && to.getTabs());
	},


	getActive: function() {
		return this.getLayout().getActiveItem();
	},


	/**
	 *
	 * @param id
	 * @return {boolean} True if the result of this means that the active view is the view that was asked for.
	 */
	onActivateView: function(id) {
		var layout = this.getLayout(),
				activeItem = layout.getActiveItem(),
				view = Ext.getCmp(id);

		if (activeItem !== view) {
			return view === layout.setActiveItem(id);
		}

		return true;
	},


	onBeforeActivateView: function(id) {
		var layout = this.getLayout(),
				activeItem = layout.getActiveItem();

		return !activeItem || activeItem.id === id || activeItem.fireEvent('beforedeactivate', activeItem, {});
	}
});
