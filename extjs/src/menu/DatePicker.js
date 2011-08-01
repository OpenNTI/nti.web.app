/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.menu.DatePicker
 * @extends Ext.menu.Menu
 * <p>A menu containing an {@link Ext.picker.Date} Component.</p>
 * <p>Notes:</p><div class="mdetail-params"><ul>
 * <li>Although not listed here, the <b>constructor</b> for this class
 * accepts all of the configuration options of <b>{@link Ext.picker.Date}</b>.</li>
 * <li>If subclassing DateMenu, any configuration options for the DatePicker must be
 * applied to the <tt><b>initialConfig</b></tt> property of the DateMenu.
 * Applying {@link Ext.picker.Date DatePicker} configuration settings to
 * <b><tt>this</tt></b> will <b>not</b> affect the DatePicker's configuration.</li>
 * </ul></div>
 *
 * {@img Ext.menu.DatePicker/Ext.menu.DatePicker.png Ext.menu.DatePicker component}
 *
 * __Example Usage__
 *
 *     var dateMenu = Ext.create('Ext.menu.DatePicker', {
 *         handler: function(dp, date){
 *             Ext.Msg.alert('Date Selected', 'You choose {0}.', Ext.Date.format(date, 'M j, Y'));
 *         }
 *     });
 *  
 *     Ext.create('Ext.menu.Menu', {
 *         width: 100,
 *         height: 90,
 *         floating: false,  // usually you want this set to True (default)
 *         renderTo: Ext.getBody(),  // usually rendered by it's containing component
 *         items: [{
 *             text: 'choose a date',
 *             menu: dateMenu
 *         },{
 *             iconCls: 'add16',
 *             text: 'icon item'
 *         },{
 *             text: 'regular item'
 *         }]
 *     });
 *
 * @author Nicolas Ferrero
 */
 Ext.define('Ext.menu.DatePicker', {
     extend: 'Ext.menu.Menu',

     alias: 'widget.datemenu',

     requires: [
        'Ext.picker.Date'
     ],

    /**
     * @cfg {Boolean} hideOnClick
     * False to continue showing the menu after a date is selected, defaults to true.
     */
    hideOnClick : true,

    /**
     * @cfg {String} pickerId
     * An id to assign to the underlying date picker. Defaults to <tt>null</tt>.
     */
    pickerId : null,

    /**
     * @cfg {Number} maxHeight
     * @hide
     */

    /**
     * The {@link Ext.picker.Date} instance for this DateMenu
     * @property picker
     * @type Ext.picker.Date
     */

    /**
     * @event click
     * @hide
     */

    /**
     * @event itemclick
     * @hide
     */

    initComponent : function(){
        var me = this;

        Ext.apply(me, {
            showSeparator: false,
            plain: true,
            border: false,
            bodyPadding: 0, // remove the body padding from the datepicker menu item so it looks like 3.3
            items: Ext.applyIf({
                cls: Ext.baseCSSPrefix + 'menu-date-item',
                id: me.pickerId,
                xtype: 'datepicker'
            }, me.initialConfig)
        });

        me.callParent(arguments);

        me.picker = me.down('datepicker');
        /**
         * @event select
         * Fires when a date is selected from the {@link #picker Ext.picker.Date}
         * @param {Ext.picker.Date} picker The {@link #picker Ext.picker.Date}
         * @param {Date} date The selected date
         */
        me.relayEvents(me.picker, ['select']);

        if (me.hideOnClick) {
            me.on('select', me.hidePickerOnSelect, me);
        }
    },

    hidePickerOnSelect: function() {
        Ext.menu.Manager.hideAll();
    }
 });
