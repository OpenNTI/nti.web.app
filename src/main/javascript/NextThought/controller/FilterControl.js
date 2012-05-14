Ext.define('NextThought.controller.FilterControl', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.filter.FilterManager',
		'NextThought.filter.FilterGroup',
		'NextThought.filter.Filter'
	],

	views: [
		'menus.Filter'
	],

	init: function() {
		this.control({
			'filter-menu':{
				'filter-control-loaded': this.setState,
				'changed': this.rebuildFilter
			}
		},{});
	},

	
	beginChanges: function(id){
		var me = this;

		if(me.beginChanges[id]) { return false; }

		me.beginChanges[id] = true;
		setTimeout(function(){ delete me.beginChanges[id]; },500);

		return true;
	},

	
	setState: function(cmp){
		if(!this.beginChanges(cmp.getId())) {
			return;
		}

		cmp.down('[isEveryone]').setChecked(true);
		cmp.down('[isEverything]').setChecked(true);

		this.rebuildFilter(cmp);
	},
	
	
	rebuildFilter: function(cmp){
		var f = this.rebuildFilter[cmp.getId()];
		if(!f){
			f = Ext.Function.createBuffered(this.rebuildFilterBuffered,50,this,[cmp]);
			this.rebuildFilter[cmp.getId()] = f;
		}
		f.call(this);
	},


	rebuildFilterBuffered: function(cmp){
		var id = cmp.getId(),
			everyone = cmp.down('[isEveryone]').checked,
			everything = cmp.down('[isEverything]').checked,
			groups = cmp.query('[isGroup]'),
			types = cmp.query('[model]'),
			Filter = NextThought.Filter,
			group = new NextThought.FilterGroup(id,NextThought.FilterGroup.OPERATION_INTERSECTION),
			people = new NextThought.FilterGroup(id,NextThought.FilterGroup.OPERATION_UNION),
			models = new NextThought.FilterGroup(id,NextThought.FilterGroup.OPERATION_UNION);

		if (!everyone) {
			group.addFilter(people);
		}
		group.addFilter(models);

		Ext.each( groups,
			function(g) {
				if(!g.checked) { return; }

				if(g.isMe){
					people.addFilter(new Filter('Creator',Filter.OPERATION_INCLUDE, $AppConfig.username));
					return;
				}

				Ext.each(g.record.get('friends'),function(f){
					people.addFilter(new Filter('Creator',Filter.OPERATION_INCLUDE, f));
				});
			},
			this);

		Ext.each(types,function(t){
			if(!t.checked && !everything) {
				return;
			}
			models.addFilter(new Filter('$className',Filter.OPERATION_INCLUDE, t.model));
		},
		this);

		//auto passthrough
		models.addFilter(new Filter('$className',Filter.OPERATION_INCLUDE, 'NextThought.model.Change'));
		models.addFilter(new Filter('$className',Filter.OPERATION_INCLUDE, 'NextThought.model.Hit'));
		models.addFilter(new Filter('$className',Filter.OPERATION_INCLUDE, 'String'));

		FilterManager.setFilter(id,group);
		delete this.beginChanges[id];
	}
});
