

Ext.define('NextThought.controller.FilterControl', {
    extend: 'Ext.app.Controller',

	views: [
		'widgets.FilterControlPanel'
		],

	_query: function(q,id){
		return Ext.ComponentQuery.query(q.replace('filter-control','#'+id));
	},

	getAllTypesButton: function(id){
		return this._query('filter-control checkboxfield[name="alltypesbutton"]',id)[0];
	},
    
    getAllGroupsButton: function(id){
    	return this._query('filter-control checkboxfield[name="allgroupsbutton"]',id)[0];
    },
    
    getGroups: function(id){
    	return this._query('filter-control checkboxfield[usergroup]',id);
    },
    
    getTypes: function(id){
    	return this._query('filter-control checkboxfield[model]',id);
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
    	});
    },
    
    
    
    beginChanges: function(id){
    	if(this.beginChanges[id])
    		return false;
    		
    	this.beginChanges[id] = true;
    	
    	return true;
    },
    
    
    setState: function(id){
    	if(!this.beginChanges(id))
    		return;
		
		//TODO: rebuild saved state
		
		this.getAllGroupsButton(id).setValue(true);
    	this.getAllTypesButton(id).setValue(true);
		Ext.each(this.getGroups(id), function(c){ c.setValue(true); },this);
		Ext.each(this.getTypes(id), function(c){ c.setValue(true); },this);
		
		this.rebuildFilter(id);
    },
    
    
    allGroupsSelected: function(me, nv, ov, opts){
		var id = me.up('filter-control').getId();
    	if(!this.beginChanges(id))
    		return;
    		
		Ext.each(this.getGroups(id), function(c){ c.setValue(nv); },this);
		this.rebuildFilter(id);
	},
    
    groupSelectionChanged: function(me, nv, ov, opts){
		var id = me.up('filter-control').getId();
		if(!this.beginChanges(id))
    		return;
    	
    	this.getAllGroupsButton(id).setValue(false);
		this.rebuildFilter(id);
	},
	
	
	
	
	
	allTypesSelected: function(me, nv, ov, opts){
		var id = me.up('filter-control').getId();
		if(!this.beginChanges(id))
    		return;
    		
		Ext.each(this.getTypes(id), function(c){ c.setValue(nv); },this);
		this.rebuildFilter(id);
	},
    
    typeSelectionChanged: function(me, nv, ov, opts){
    	var id = me.up('filter-control').getId();
    	if(!this.beginChanges(id))
    		return;
    	
		this.getAllTypesButton(id).setValue(false);
		this.rebuildFilter(id);
	},
	
	
	
	
	
	rebuildFilter: function(id){
		var f = this.rebuildFilter[id];
		if(!f){
			f = Ext.Function.createBuffered(this.rebuildFilterBuffered,50,this,[id]);
			this.rebuildFilter[id] = f; 
		}
		f.call();
	},
	
	rebuildFilterBuffered: function(id){
		var isUnknown = /unresolved/i,
			filter = {groups:{},types:[], shareTargets:{}}, 
			cmp = Ext.getCmp(id),
            allGroups = this.getAllGroupsButton(id).getValue(),
			groups = this.getGroups(id),
			types = this.getTypes(id),
			u = _AppConfig.server.username;

        if(allGroups) filter.groups = 'all';
        else {
            Ext.each( groups,
                function(g) {
                    if(!g.getValue()) return;
                    if(g.isMe){
                        filter.includeMe = true;
                        return;
                    }

                    Ext.each(g.record.get('friends'),function(f){
                        filter.shareTargets[f]=true;
                    });

                    filter.groups[g.record.get('Username')] = g.record;
                },
                this);
        }

		
		if(filter.includeMe){
			filter.includeMe = u;
			// filter.shareTargets[u] = true;
		}
		
		Ext.each(types,function(t){
			if(!t.getValue()) return;
			filter.types.push(t.model);
		},
		this);
		
		//console.log('new filter:',filter);
		cmp.fireEvent('filter-changed', filter);
		this.beginChanges[id] = undefined;
	}
});