/**
 * This class implements the annotation event domain. All classes extending from
 * {@link NextThought.view.annotations.Base} are included in this domain.
 *
 * @protected
 */
Ext.define('NextThought.app.domain.Annotation', {
    extend: 'Ext.app.EventDomain',
    singleton: true,

    requires: [
        'NextThought.view.annotations.Base'
    ],

    type: 'annotation',

    constructor: function() {
        this.callParent();
        this.monitor(NextThought.view.annotations.Base);
    },

	match: function(target, selector) {
        return target.is(selector);
    }
});
