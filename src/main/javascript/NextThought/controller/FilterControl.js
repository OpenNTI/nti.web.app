Ext.define('NextThought.controller.FilterControl', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.filter.FilterManager',
		'NextThought.filter.FilterGroup',
		'NextThought.filter.Filter',
		'NextThought.filter.ValueContainedFilter',
		'NextThought.filter.ValueContainsFilter'
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

		function process(f){
			var query, val = f.value, item;
			if(!f.isFilterGroup){
				query = queries[f.fieldName];
				if(!Ext.isArray(query)){
					query = queries[f.fieldName] = cmp.query(query);
				}

				Ext.each(query,function(item,i,a){
					var test = item.model;

					if(!Ext.isPrimitive(val)){
						val = val.get('Username');
					}

					if(!test) {
						test = item.record.get('Username');
					}


					if(test === val){
						item.setChecked(true,true);
						a.splice(i,1);
						return false;
					}
					return true;
				});
			}
			else {
				Ext.each(f.value,process);
			}
		}


		var current = FilterManager.getCurrentFilter(cmp.getId()),
			everyone = cmp.down('[isEveryone]'),
			everything = cmp.down('[isEverything]'),
			queries = { 'Creator': '[isGroup]', '$className': '[model]' },
			models;

		if(!current){
			everyone.setChecked(true,true);
			everything.setChecked(true,true);
		}
		else {
			everyone.setChecked(false,true);
			everything.setChecked(false,true);

			process(current);

			//all unchecked, then check "everyone"...leave it be otherwise
			if(Ext.Array.filter(cmp.query('[isGroup]'), function(a){ return a.checked; }).length === 0){
				everyone.setChecked(true,false);
			}

			models = cmp.query('[model]');
			//All checked or All unchecked, check the "everything", otherwise leave it be
			if(models.length === Ext.Array.filter(models,function(i){return !i.checked;}).length
			|| models.length === Ext.Array.filter(models,function(i){return i.checked;}).length){
				everything.setChecked(true,false);
			}

		}

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
			nothing = cmp.down('[isNothing]').checked,
			groups = cmp.query('[isTarget],[isActor]'),
			types = cmp.query('[model]'),
			Filter = NextThought.Filter,
			group = new NextThought.FilterGroup(id,NextThought.FilterGroup.OPERATION_INTERSECTION),
			people = new NextThought.FilterGroup(id,NextThought.FilterGroup.OPERATION_UNION),
			models = new NextThought.FilterGroup(id,NextThought.FilterGroup.OPERATION_UNION),
			dfls = new NextThought.FilterGroup(id, NextThought.FilterGroup.OPERATION_INTERSECTION);

		group.addFilter(models);

		Ext.each( groups,
			function(g) {
				if(!g.checked) { return; }

				if(g.isMe){
					people.addFilter(new Filter('Creator',Filter.OPERATION_INCLUDE, $AppConfig.username));
					return;
				}
				if(g.record.isDFL){
					dfls.addFilter(new NextThought.filter.ValueContainedFilter('sharedWith',Filter.OPERATION_INCLUDE, g.record));
				}
				else{
					people.addFilter(new NextThought.filter.ValueContainsFilter('Creator', Filter.OPERATION_INCLUDE, g.record));
				}
			},
			this);

		if(!everyone && !nothing){
			if(!Ext.isEmpty(people.value)){
				group.addFilter(people);
			}
			if(!Ext.isEmpty(dfls.value)){
				group.addFilter(dfls);
			}
		}

		Ext.each(types,function(t){
			if(!t.checked && !everything) {
				return;
			}
			models.addFilter(new Filter('$className',Filter.OPERATION_INCLUDE, t.model));
		},
		this);

		//auto passthrough
		//why?
//		models.addFilter(new Filter('$className',Filter.OPERATION_INCLUDE, 'NextThought.model.Change'));
//		models.addFilter(new Filter('$className',Filter.OPERATION_INCLUDE, 'NextThought.model.Hit'));
		models.addFilter(new Filter('$className',Filter.OPERATION_INCLUDE, 'String'));
		models.addFilter(new Filter('$className',Filter.OPERATION_INCLUDE, 'NextThought.model.Redaction'));

		FilterManager.setFilter(id,group);
		delete this.beginChanges[id];
	}
});
