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