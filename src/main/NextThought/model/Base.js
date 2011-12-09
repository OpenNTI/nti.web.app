Ext.define('NextThought.model.Base', {
    extend: 'Ext.data.Model',

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
    }
});


Ext.data.Types.LINKS = {
	type: 'links',
	sortType: function(){ return ''; },

	convert: function(v){
		return {
			links: v,
			getLink: function(rel){
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

/* converters for models which reference other models*/
Ext.data.Types.SINGLEITEM = {
    type: 'singleItem',
    convert: function(v) {
        return ParseUtils.parseItems([v])[0];
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
                    typeof(o)=='string'
                        ? o
                        : o.get
                            ? o.get('Username')
                            : o.Username
                                ? o.Username
                                : null;
                if(!p)
                    console.warn("WARNING: Could not handle Object: ", o, a);
                else  {
                    u.push(p);
                    //asynchronously resolve this user so its cached and ready
                    UserRepository.prefetchUser(p);
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
