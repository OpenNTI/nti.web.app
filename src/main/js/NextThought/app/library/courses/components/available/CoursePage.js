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
		cls: 'tab{[values.active ? " active" : ""]}', 'data-title': '{label}', html: '{label}'
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


	setItems: function(upcoming, current, archived) {
		this.removeAll(true);
		this.clearTabs();

		if (upcoming && upcoming.length) {
			this.addCourses(upcoming, 'Upcoming Courses');
			this.addTab({label: 'Upcoming'});
		}

		if (current && current.length) {
			this.addCourses(current, 'Current Courses');
			this.addTab({label: 'Current', active: true});
		}

		if (archived && archived.length) {
			this.addBinnedCourses(this.binCourses(archived), 'Archived Courses');
			this.addTab({label: 'Archived'});
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
