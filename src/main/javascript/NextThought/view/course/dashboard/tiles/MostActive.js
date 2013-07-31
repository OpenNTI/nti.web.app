Ext.define('NextThought.view.course.dashboard.tiles.MostActive',{
	extend: 'NextThought.view.course.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-most-active',

	statics: {

		getTileFor: function(effectiveDate, course, locationInfo, courseNodeRecord){
			return this.create({
				lastModified: courseNodeRecord.get('date'),
				locationInfo: locationInfo,
				courseNodeRecord: courseNodeRecord
			});
		}

	},

	config: {
		cols: 2,
		rows: 4,
		weight: 9
	},


	initComponent: function(){
		this.callParent(arguments);
		this.view = this.add({
			xtype: 'dataview',
			cls:'active-users',
			ui: 'tile',

			store: 'ext-empty-store',

			overItemCls: 'x-item-over',
			itemSelector:'.user',
			tpl: Ext.DomHelper.markup({
				tag: 'tpl', 'for':'.', cn: [{
					cls: 'user',
					'data-qtip': '{displayName}',
					style: {
						backgroundImage: 'url({avatarURL})'
					}
				}]
			})
		});

		this.box = this.add({
			xtype: 'container',
			cls: 'user-container-body'
		});

		this.loadSummary();
	},


	loadSummary: function(){
		var rec = this.getCourseNodeRecord(),
			pi = rec.get('pageInfo'),
			req;

		if(!pi){
			rec.listenForFieldChange('pageInfo','loadSummary',this,true);
			return;
		}

		req = {
			url: pi.getLink('TopUserSummaryData'),
			scope: this,
			success: this.onSummaryLoad,
			failure: this.onSummaryFailed
		};

		Ext.Ajax.request(req);
	},


	onSummaryFailed: function(){
		console.error('Summary failed to load:',arguments);
	},


	onSummaryLoad: function(resp){
		var json = Ext.decode(resp.responseText,true) || {},
			users = [], me = this;

		function pluckUsers(i){ if(i){users.push(i.Username);} }

		Ext.each(json.Items||[],pluckUsers);

		UserRepository.getUser(users,function(u){
			me.store = Ext.data.Store({
				model: 'NextThought.model.User',
				proxy: 'memory',
				data: u
			});
			me.view.bindStore(me.store);
			me.view.getSelectionModel().select(0);
		});
	}
});
