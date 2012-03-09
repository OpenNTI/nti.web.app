Ext.define('NextThought.controller.FilterControl', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.filter.FilterManager',
		'NextThought.filter.FilterGroup',
		'NextThought.filter.Filter'
	],

	views: [
		'widgets.FilterControlPanel'
	],

	getAllTypesButton: function(cmp){
		return cmp.down('checkboxfield[name="alltypesbutton"]');
	},
	
	getAllGroupsButton: function(cmp){
		return cmp.down('checkboxfield[name="allgroupsbutton"]');
	},
	
	getGroups: function(cmp){
		return cmp.query('checkboxfield[usergroup]');
	},
	
	getTypes: function(cmp){
		return cmp.query('checkboxfield[model]');
	},
	
	init: function() {
		this.control({
			'filter-control':{
				'filter-control-loaded': this.setState
			},
			'filter-control checkboxfield[name="allgroupsbutton"]': {
				change: this.allGroupsSelected
			},
			'filter-control checkboxfield[usergroup]':{
				change:this.groupSelectionChanged
			},
			'filter-control checkboxfield[name="alltypesbutton"]': {
				change: this.allTypesSelected
			},
			'filter-control checkboxfield[model]':{
				change:this.typeSelectionChanged
			}
		},{});
	},

	
	beginChanges: function(id){
		if(this.beginChanges[id]) { return false; }
		return this.beginChanges[id] = true;
	},
	
	
	setState: function(cmp){
		if(!this.beginChanges(cmp.getId())) {
			return;
		}
		//TODO: rebuild saved state
		
		this.getAllGroupsButton(cmp).setValue(true);
		this.getAllTypesButton(cmp).setValue(true);
		Ext.each(this.getGroups(cmp), function(c){ c.setValue(true); },this);
		Ext.each(this.getTypes(cmp), function(c){ c.setValue(true); },this);
		
		this.rebuildFilter(cmp);
	},
	
	
	allGroupsSelected: function(me, nv){
		var cmp = me.up('filter-control'),
			id = cmp.getId();

		if(!this.beginChanges(id)) {
			return;
		}
			
		Ext.each(this.getGroups(cmp), function(c){ c.setValue(nv); },this);
		this.rebuildFilter(cmp);
	},
	
	groupSelectionChanged: function(me){
		var cmp = me.up('filter-control'),
			id = cmp.getId();
		if(!this.beginChanges(id)) {
			return;
		}
		
		this.getAllGroupsButton(cmp).setValue(false);
		this.rebuildFilter(cmp);
	},
	
	
	
	
	
	allTypesSelected: function(me, nv){
		var cmp = me.up('filter-control'),
			id = cmp.getId();
		if(!this.beginChanges(id)) {
			return;
		}
			
		Ext.each(this.getTypes(cmp), function(c){ c.setValue(nv); },this);
		this.rebuildFilter(cmp);
	},
	
	typeSelectionChanged: function(me){
		var cmp = me.up('filter-control'),
			id = cmp.getId();
		if(!this.beginChanges(id)) {
			return;
		}
		
		this.getAllTypesButton(cmp).setValue(false);
		this.rebuildFilter(cmp);
	},
	
	
	
	
	
	rebuildFilter: function(cmp){
		var f = this.rebuildFilter[cmp.getId()];
		if(!f){
			f = Ext.Function.createBuffered(this.rebuildFilterBuffered,50,this,[cmp]);
			this.rebuildFilter[cmp.getId()] = f;
		}
		f.call(window);
	},
	
	rebuildFilterBuffered: function(cmp){
		var id = cmp.getId(),
			allGroups = this.getAllGroupsButton(cmp).getValue(),
			groups = this.getGroups(cmp),
			types = this.getTypes(cmp),
			Filter = NextThought.Filter,
			group = new NextThought.FilterGroup(id,NextThought.FilterGroup.OPERATION_INTERSECTION),
			people = new NextThought.FilterGroup(id,NextThought.FilterGroup.OPERATION_UNION),
			models = new NextThought.FilterGroup(id,NextThought.FilterGroup.OPERATION_UNION);

		group.addFilter(people);
		group.addFilter(models);

		Ext.each( groups,
			function(g) {
				if(!g.getValue()) { return; }

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
			if(!t.getValue()) {
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
		this.beginChanges[id] = undefined;
	}
});
