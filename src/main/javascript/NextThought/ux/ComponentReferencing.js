/**
 * This plugin extracts the concepts of ExtJS's Controllers ability to reference any component and makes them available
 * to any component to plugin.
 *
 * Copied from ExtJS 4.2.0
 * {@see Ext.app.Controller#ref()}
 * {@see Ext.app.Controller#addRef()}
 * {@see Ext.app.Controller#getRef()}
 * {@see Ext.app.Controller#hasRef()}
 */
Ext.define('NextThought.ux.ComponentReferencing',{
	extend: 'Ext.AbstractPlugin',
	alias: 'plugin.component-referencing',

	init: function(){
		this.callParent(arguments);
		this.ref(this.getCmp().refs);
		//console.debug('Registered',this.references);
	},


	destroy: function(){
		//meh, nothing to cleanup.
	},


	//<editor-fold desc="Code from Ext.app.Controller">
	ref: function(refs) {
        var me = this,
			cmp = me.getCmp(),
            i = 0,
            length = refs.length,
            info, ref, fn;

        refs = Ext.Array.from(refs,false);

        me.references = me.references || [];

        for (i; i < length; i++) {
            info = refs[i];
            ref  = info.ref;
            fn   = 'get' + Ext.String.capitalize(ref);

            if (!me[fn]) {
                cmp[fn] = Ext.Function.pass(me.getRef, [ref, info], me);
            }
            me.references.push(ref.toLowerCase());
        }
    },

    /**
     * Registers one or more {@link #refs references}.
     *
     * @param {Object/Object[]} refs
     */
    addRef: function(refs) {
        this.ref(refs);
    },

    getRef: function(ref, info, config) {
        var me = this,
            refCache = me.refCache = (me.refCache || {}),
            cached = refCache[ref];

        info = info || {};
        config = config || {};

        Ext.apply(info, config);

        if (info.forceCreate) {
            return Ext.ComponentManager.create(info, 'component');
        }

        if (!cached) {
            if (info.selector) {
                refCache[ref] = cached = Ext.ComponentQuery.query(info.selector)[0];
            }

            if (!cached && info.autoCreate) {
                refCache[ref] = cached = Ext.ComponentManager.create(info, 'component');
            }

            if (cached) {
                cached.on('beforedestroy', function() {
                    refCache[ref] = null;
                });
            }
        }

        return cached;
    },

    /**
     * Returns `true` if a {@link #refs reference} is registered.
     *
     * @return {Boolean}
     */
    hasRef: function(ref) {
        var references = this.references;
        return references && Ext.Array.indexOf(references, ref.toLowerCase()) !== -1;
    }
	//</editor-fold>

});
