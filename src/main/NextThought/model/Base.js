Ext.data.Types.LINKS = {
	type: 'links',
	sortType: function(){ return ''; },

	convert: function(v){
		return {
			links: v,
			getRelHref: function(rel){
				var i, c = this.links,len = c.length;
				if(typeof(c) === 'object'){
					for(i=len-1; i>=0; i--){
						if(c[i].rel == rel)
							return c[i].href;
					}
				}
				else {
					console.warn('bad Links value: "', c, '" it is a', typeof(c), 'instead of an array');
				}

				return null;
			}
		};
	}
};


Ext.define('NextThought.model.Base', {
    extend: 'Ext.data.Model',
	requires: [
		'NextThought.util.ParseUtils',
		'NextThought.proxy.Rest'
	],
	idProperty: 'OID',
	mimeType: 'application/vnd.nextthought',
	proxy: { type: 'nti' },
	fields: [
		{ name: 'Class', type: 'string' },
		{ name: 'ContainerId', type: 'string' },
		{ name: 'CreatedTime', type: 'date', dateFormat: 'timestamp', defaultValue: new Date() },
		{ name: 'Creator', type: 'string' },
		{ name: 'ID', type: 'string' },
		{ name: 'OID', type: 'string' },
		{ name: 'Last Modified', type: 'date', dateFormat: 'timestamp', defaultValue: new Date() },
		{ name: 'Links', type: 'links', defaultValue: [] },
		{ name: 'MimeType', type: 'string' },
		{ name: 'NTIID', type: 'string' },
		{ name: 'accepts', type: 'auto', defaultValue: [] }
	],


	constructor: function(){
		var c, f = this.fields,
			cName = this.self.getName().split('.').pop(),
			cField = f.getByKey('Class');

		if(!cField.defaultValue)
			cField.defaultValue = cName;

		if(!(new RegExp(cName,'i')).test(this.mimeType)){
			this.mimeType += '.'+cName.toLowerCase();
		}
		else{
			console.warn('using self declared mimeTime:', this.mimeType);
		}

		f.getByKey('MimeType').defaultValue = this.mimeType;

		c = this.callParent(arguments);

		if(!this.isModifiable()){
			this.destroy = Ext.emptyFn();
			this.save = Ext.emptyFn();
		}

		return c;
	},


	getModelName: function() {
		return this.fields.getByKey('Class').defaultValue;
	},


	getLink: function(rel){
		var ref = this.get('Links').getRelHref(rel);
		return ref? _AppConfig.server.host + ref : null;
	},


	isModifiable: function(){
		try{
			return this.phantom||this.getLink('edit')!==null;
		}
		catch(e){
			console.warn('No getLink()!');
		}
		return false;
	},


    equal: function(b) {
        var a = this,
            r = true;

        a.fields.each(
            function(f){
                var fa = a.get(f.name),
                    fb = b.get(f.name);

                if (fa !== fb){

                    if(Ext.isArray(fa) && Ext.isArray(fb) && arrayEquals(fa, fb)){
                        return;
                    }

                    if(Ext.isDate(fa) && Ext.isDate(fb) && fa+0 == fb+0){
                        return;
                    }


                    r=false;
                    return false;
                }
            }
        );

        return r;
    },

    toJSON: function() {
        var data = {},
            me = this;

        this.fields.each(
            function(f){
                var x = me.get(f.name);
                if (Ext.isDate(x)) {
                    x = x.getTime()/1000;
                }
                else if (x && x.toJSON) x = x.toJSON();
                else if(x && Ext.isArray(x)) {
                    Ext.each(x, function(o, i){
                        x[i] = o.toJSON ? o.toJSON() : o;
                    });
                }

                data[f.name] = Ext.clone(x);
            }
        );
        return data;
    }
});




/* converters for models which reference other models*/
Ext.data.Types.SINGLEITEM = {
    type: 'singleItem',
    convert: function(v) {
        return !v ? null : ParseUtils.parseItems([v])[0];
    },
    sortType: function(v) {
        console.warn('sort by Item:',arguments);
        return '';
    }
};

Ext.data.Types.ARRAYITEM = {
    type: 'arrayItem',
    convert: function(v) {
        return ParseUtils.parseItems(v);
    },
    sortType: function(v) {
        console.warn('sort by Item:',arguments);
        return '';
    }
};

Ext.data.Types.USERLIST = {
	type: 'UserList',
    convert: function(v) {
        try {
            var a = arguments,
                u = [];

            if(v) Ext.each(v, function(o){
                var p =
                    typeof(o)=='string' ?
						o : o.get ?
							o.get('Username') : o.Username ?
								o.Username : null;
                if(!p)
                    console.warn("WARNING: Could not handle Object: ", o, a);
                else  {
                    u.push(p);
                    //asynchronously resolve this user so its cached and ready
                    UserRepository.prefetchUser(o);
                }
            });

            return u;
        }
        catch (e) {
            console.error('USERLIST: Parsing Error: ',e.message, e.stack);
            return v;
        }
    },
    sortType: function(v) {
		console.warn('sort by UserList:',arguments);
        return '';
    }
};
