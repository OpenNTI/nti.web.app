Ext.define('NextThought.app.course.info.Index', {
	extend: 'NextThought.common.components.NavPanel',
	alias: 'widget.course-info',

	title: '',

	requires: [
		'NextThought.app.course.info.components.Outline',
		'NextThought.app.course.info.components.Body'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	navigation: {xtype: 'course-info-outline'},
	body: {xtype: 'course-info-body'},

	initComponent: function() {
		this.callParent(arguments);

		var me = this;
		me.initRouter();
		me.addDefaultRoute(this.showInfo.bind(me));
		me.on('activate', this.onActivate.bind(me));
	},

	onActivate: function() {
		this.setTitle(this.title);
	},

	bundleChanged: function(bundle) {
		var me = this,
			catalogEntry = bundle && bundle.getCourseCatalogEntry && bundle.getCourseCatalogEntry();

		function update(info, status, showRoster) {
			me.hasInfo = !!info;

			me[me.infoOnly ? 'addCls' : 'removeCls']('info-only');
			me.navigation.margin = (me.infoOnly ? '105' : '0') + ' 5 5 0';

			me.body.getLayout().setActiveItem('info');//always reset
			me.body.getComponent('info').setContent(info, status);
			// me.body.getComponent('roster').setContent(showRoster && bundle);
			me.navigation.setContent(info, status, showRoster);
		}

		me.hasInfo = !!catalogEntry;
		me.infoOnly = catalogEntry && catalogEntry.get('Preview') === true;

		if (bundle && bundle.getWrapper) {
			return bundle.getWrapper()
				.done(function(e) {
					update(catalogEntry, e.get('Status'), !!e.isAdministrative);
				})
				.fail(function() {
					//hide tab?
				});
		}

		return Promise.resolve();
	},

	showInfo: function(route, subroute){
		// TODO: NOT IMPLEMENTED
		console.log(arguments);
	}

});
