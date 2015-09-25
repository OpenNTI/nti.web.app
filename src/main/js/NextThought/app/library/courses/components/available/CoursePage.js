Ext.define('NextThought.app.library.courses.components.available.CoursePage', {
	extend: 'NextThought.app.library.courses.components.Page',
	alias: ['widget.library-availalble-courses-page'],

	cls: 'page scrollable',

	defaultType: 'course-catalog-collection',

	getTargetEl: function() {
		return this.body;
	},

	childEls: ['body'],

	tabTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'tab{[values.active ? " active" : ""]}', 'data-category': '{category}', 'data-title': '{label}', html: '{label}'
	})),

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'tabs' },
		{ id: '{id}-body', cls: 'body-container',
			cn: ['{%this.renderContainer(out,values)%}'] 
		}
	]),


	renderSelectors: {
		tabsEl: '.tabs'
	},


	getCourseStore: function(data) {
		return new Ext.data.Store({
			model: 'NextThought.model.courses.CourseCatalogEntry',
			data: data,
			sorters: [{property: 'ProviderUniqueID', direction: 'ASC'}]
		});
	},


	afterRender: function() {
		this.callParent(arguments);
		this.setPageHeight();
		this.mon(this.getTargetEl(), 'scroll', this.onScroll.bind(this));
		this.mon(this.tabsEl, 'click', this.onTabClick.bind(this));
	},


	setItems: function(upcoming, current, archived) {
		this.removeAll(true);
		this.clearTabs();

		if (upcoming && upcoming.length) {
			this.addCourses(upcoming, 'Upcoming Courses', null, {category: 'upcoming'});
			this.addTab({label: 'Upcoming', category: 'upcoming'});
		}

		if (current && current.length) {
			this.addCourses(current, 'Current Courses', null, {category: 'current'});
			this.addTab({label: 'Current', category: 'current', active: true});
		}

		if (archived && archived.length) {
			this.addBinnedCourses(this.binCourses(archived), 'Archived Courses', {category: 'archived'});
			this.addTab({label: 'Archived', category: 'archived'});
		}

		this.onceRendered
			.then(this.setTops.bind(this));

	},


	setPageHeight: function () {
		var h = this.ownerCt.el.getHeight(),
			me = this;

		wait(10)
			.then(function () {
				me.el.setStyle('height', (h - 100) + 'px');
			});
	},


	setTops: function () {
		debugger;
		var upcoming = this.down('[category=upcoming]'),
			current = this.down('[category=current]'),
			archived = this.down('[category=archived]'),
			first = this.down('[category]'),
			defaulTop = 0, t;

		this.scrollTops = {};
		if (first) {
			defaulTop = first.el.getTop();
		}
		
		if (upcoming) {
			this.scrollTops['upcoming'] = upcoming.el.getTop() - defaulTop;
		}
		if (current) {
			this.scrollTops['current'] = current.el.getTop() - defaulTop;	
		}
		if (archived) {
			this.scrollTops['archived'] = archived.el.getTop() - defaulTop;
		}
	},


	onScroll: function (e) {
		var target = e.getTarget(),
			scrollTop = target && target.scrollTop, key, selectTab, 
			activeTabEl = this.tabsEl.down('.active');

		if (!this.scrollTops) {
			this.scrollTops = {};
		}

		for(key in this.scrollTops) {
			if (this.scrollTops.hasOwnProperty(key)) {
				if (!selectTab) {
					selectTab = key;
				}
				if (this.scrollTops[key] <= scrollTop) {
					selectTab = key;
				}
			}
		}

		if (selectTab) {
			selectTab = this.tabsEl.down('[data-category='+ selectTab +']');

			if (selectTab && activeTabEl != selectTab) {
				activeTabEl.removeCls('active');
				selectTab.addCls('active');
			}
		}
	},


	onTabClick: function (e) {	
		var target = Ext.get(e.getTarget()),
			isTab = target && target.hasCls('tab'),
			category = target && target.getAttribute('data-category'), 
			activeTab = this.tabsEl.down('.active');

		if (!isTab || target.hasCls('active')) {
			return;
		}

		if (this.scrollTops[category] >= 0) {
			this.getTargetEl().scrollTo('top', this.scrollTops[category], true);
		}
	},


	addTab: function(data) {
		this.tabTpl.append(this.tabsEl, data);
	},


	clearTabs: function(){
		if (!this.rendered) { return; }

		this.tabsEl.query('.tab').map(function(a){
			var el = Ext.get(a);
			if (el) {
				el.remove();
			}
		}); 
	}
});
