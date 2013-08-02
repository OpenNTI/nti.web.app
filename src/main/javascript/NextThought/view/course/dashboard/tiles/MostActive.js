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
			emptyText: Ext.DomHelper.markup([{
				cls:"history nothing rhp-empty-list",
				html: 'No Activity Yet'
			}]),

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
			}),
			listeners:{
				scope: this,
				'select': 'onUserSelected'
			}
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
		var items = (Ext.decode(resp.responseText,true) || {}).Items || [],
			users = [],
			me = this;

		function pluckUsers(i){ if(i){users.push(i.user||i.Username);} }

		function byTotals(a,b){
			var aN = a.UsersName || '',
				bN = b.UsersName || '';
			a = a.Total;
			b = b.Total;
			if(a!==b){
				return a<b ? -1 : 1;
			}

			return aN.localeCompare(bN);
		}

		function notMe(r){
			return !isMe(r);
		}

		Ext.each(Ext.Array.filter(items,notMe),pluckUsers);

//		if(users.length === 0){
			//
//		}

		UserRepository.getUser(users, function(u){
			function apply(i,x){
				if(!u[x] || i.Username !== u[x].getId()){
					console.error('bad mapping');
					return;
				}
				Ext.apply(i,{
					user: u[x],
					usersName: u[x].getName()
				});
			}

			Ext.each(items,apply);
			Ext.Array.sort(items,byTotals);
			users = [];
			Ext.each(items,pluckUsers);

			me.store = Ext.data.Store({
				model: 'NextThought.model.User',
				proxy: 'memory',
				data: users.slice(0,9)//limit 9
			});

			me.view.bindStore(me.store);
			me.view.getSelectionModel().select(0);
		});
	},


	onUserSelected: function(selModel, user){
		var v,
			me = this,
			box = me.box, req, blog = user.hasBlog();

		me.user = user;

		box.removeAll(true);
		box.add({xtype: 'tile-title', label:user.getName(), heading:'Thought Leader' });
		
		v = {
			xtype: 'dataview',
			cls:'user-items',
			ui: 'tile',

			emptyText: Ext.DomHelper.markup([{
				cls:"history nothing rhp-empty-list",
				html: 'No Thoughts'
			}]),
			deferEmptyText: false,
			overItemCls: 'x-item-over',
			itemSelector:'.item',
			tpl: Ext.DomHelper.markup({
				tag: 'tpl', 'for':'.', cn: [{
					cls: 'item',
					cn:[
						{ cls: 'controls', cn: [{ cls: 'like {likeState}', html:'{[values.LikeCount==0?\"\":values.LikeCount]}' }]},
						{ cls: 'title', html:'{title}'}
					]
				}]
			}),
			listeners: {
				scope: me,
				'itemclick':'onItemClicked'
			}
		};


		function blogLoaded(s,rec){
			if(rec.length>3){
				s.remove(rec.slice(3));
				box.add({xtype:'box', ui:'tile', cls:'more-posts', autoEl: {
					cn: [{},{},{}]
				}});
			}
		}

		function loadContents(r){
			var record = ParseUtils.parseItems( r.responseText ).first(), //Set the blog record.
				store = NextThought.store.Blog.create({pageSize: 4});

			store.proxy.url = record.getLink('contents');
			Ext.apply(store.proxy.extraParams,{
				sortOn:'lastModified',
				sortOrder:'descending'
			});

			v.store = store;
			box.add(v);
			me.mon(store,'load',blogLoaded);
			store.load();
		}


		if(!blog){
			box.add(v);
			return;
		}

		req = {
			url: user.getLink('Blog'),
			scope: this,
			success: loadContents,
			failure: this.fail
		};

		Ext.Ajax.request(req);
	},


	fail: function(){ console.error(':('); }



	onItemClicked: function(view, rec, dom, i, e){
		if(e.getTarget('.like')){
			e.stopEvent();
			rec.like();
			return;
		}
		//debugger;
		this.fireEvent('navigate-to-blog',this.user, rec.get('ID'));
	}

});
