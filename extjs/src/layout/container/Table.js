/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.layout.container.Table
 * @extends Ext.layout.container.Auto
 * <p>This layout allows you to easily render content into an HTML table.  The total number of columns can be
 * specified, and rowspan and colspan can be used to create complex layouts within the table.
 * This class is intended to be extended or created via the <code>layout: {type: 'table'}</code>
 * {@link Ext.container.Container#layout} config, and should generally not need to be created directly via the new keyword.</p>
 * <p>Note that when creating a layout via config, the layout-specific config properties must be passed in via
 * the {@link Ext.container.Container#layout} object which will then be applied internally to the layout.  In the
 * case of TableLayout, the only valid layout config properties are {@link #columns} and {@link #tableAttrs}.
 * However, the items added to a TableLayout can supply the following table-specific config properties:</p>
 * <ul>
 * <li><b>rowspan</b> Applied to the table cell containing the item.</li>
 * <li><b>colspan</b> Applied to the table cell containing the item.</li>
 * <li><b>cellId</b> An id applied to the table cell containing the item.</li>
 * <li><b>cellCls</b> A CSS class name added to the table cell containing the item.</li>
 * </ul>
 * <p>The basic concept of building up a TableLayout is conceptually very similar to building up a standard
 * HTML table.  You simply add each panel (or "cell") that you want to include along with any span attributes
 * specified as the special config properties of rowspan and colspan which work exactly like their HTML counterparts.
 * Rather than explicitly creating and nesting rows and columns as you would in HTML, you simply specify the
 * total column count in the layoutConfig and start adding panels in their natural order from left to right,
 * top to bottom.  The layout will automatically figure out, based on the column count, rowspans and colspans,
 * how to position each panel within the table.  Just like with HTML tables, your rowspans and colspans must add
 * up correctly in your overall layout or you'll end up with missing and/or extra cells!  Example usage:</p>
 * {@img Ext.layout.container.Table/Ext.layout.container.Table.png Ext.layout.container.Table container layout}
 * <pre><code>
// This code will generate a layout table that is 3 columns by 2 rows
// with some spanning included.  The basic layout will be:
// +--------+-----------------+
// |   A    |   B             |
// |        |--------+--------|
// |        |   C    |   D    |
// +--------+--------+--------+
    Ext.create('Ext.panel.Panel', {
        title: 'Table Layout',
        width: 300,
        height: 150,
        layout: {
            type: 'table',
            // The total column count must be specified here
            columns: 3
        },
        defaults: {
            // applied to each contained panel
            bodyStyle:'padding:20px'
        },
        items: [{
            html: 'Cell A content',
            rowspan: 2
        },{
            html: 'Cell B content',
            colspan: 2
        },{
            html: 'Cell C content',
            cellCls: 'highlight'
        },{
            html: 'Cell D content'
        }],
        renderTo: Ext.getBody()
    });
</code></pre>
 */

Ext.define('Ext.layout.container.Table', {

    /* Begin Definitions */

    alias: ['layout.table'],
    extend: 'Ext.layout.container.Auto',
    alternateClassName: 'Ext.layout.TableLayout',

    /* End Definitions */

    /**
     * @cfg {Number} columns
     * The total number of columns to create in the table for this layout.  If not specified, all Components added to
     * this layout will be rendered into a single row using one column per Component.
     */

    // private
    monitorResize:false,

    type: 'table',

    // Table layout is a self-sizing layout. When an item of for example, a dock layout, the Panel must expand to accommodate
    // a table layout. See in particular AbstractDock::onLayout for use of this flag.
    autoSize: true,

    clearEl: true, // Base class will not create it if already truthy. Not needed in tables.

    targetCls: Ext.baseCSSPrefix + 'table-layout-ct',
    tableCls: Ext.baseCSSPrefix + 'table-layout',
    cellCls: Ext.baseCSSPrefix + 'table-layout-cell',

    /**
     * @cfg {Object} tableAttrs
     * <p>An object containing properties which are added to the {@link Ext.core.DomHelper DomHelper} specification
     * used to create the layout's <tt>&lt;table&gt;</tt> element. Example:</p><pre><code>
{
    xtype: 'panel',
    layout: {
        type: 'table',
        columns: 3,
        tableAttrs: {
            style: {
                width: '100%'
            }
        }
    }
}</code></pre>
     */
    tableAttrs:null,

    /**
     * @cfg {Object} trAttrs
     * <p>An object containing properties which are added to the {@link Ext.core.DomHelper DomHelper} specification
     * used to create the layout's <tt>&lt;tr&gt;</tt> elements.
     */

    /**
     * @cfg {Object} tdAttrs
     * <p>An object containing properties which are added to the {@link Ext.core.DomHelper DomHelper} specification
     * used to create the layout's <tt>&lt;td&gt;</tt> elements.
     */

    /**
     * @private
     * Iterates over all passed items, ensuring they are rendered in a cell in the proper
     * location in the table structure.
     */
    renderItems: function(items) {
        var tbody = this.getTable().tBodies[0],
            rows = tbody.rows,
            i = 0,
            len = items.length,
            cells, curCell, rowIdx, cellIdx, item, trEl, tdEl, itemCt;

        // Calculate the correct cell structure for the current items
        cells = this.calculateCells(items);

        // Loop over each cell and compare to the current cells in the table, inserting/
        // removing/moving cells as needed, and making sure each item is rendered into
        // the correct cell.
        for (; i < len; i++) {
            curCell = cells[i];
            rowIdx = curCell.rowIdx;
            cellIdx = curCell.cellIdx;
            item = items[i];

            // If no row present, create and insert one
            trEl = rows[rowIdx];
            if (!trEl) {
                trEl = tbody.insertRow(rowIdx);
                if (this.trAttrs) {
                    trEl.set(this.trAttrs);
                }
            }

            // If no cell present, create and insert one
            itemCt = tdEl = Ext.get(trEl.cells[cellIdx] || trEl.insertCell(cellIdx));
            if (this.needsDivWrap()) { //create wrapper div if needed - see docs below
                itemCt = tdEl.first() || tdEl.createChild({tag: 'div'});
                itemCt.setWidth(null);
            }

            // Render or move the component into the cell
            if (!item.rendered) {
                this.renderItem(item, itemCt, 0);
            }
            else if (!this.isValidParent(item, itemCt, 0)) {
                this.moveItem(item, itemCt, 0);
            }

            // Set the cell properties
            if (this.tdAttrs) {
                tdEl.set(this.tdAttrs);
            }
            tdEl.set({
                colSpan: item.colspan || 1,
                rowSpan: item.rowspan || 1,
                id: item.cellId || '',
                cls: this.cellCls + ' ' + (item.cellCls || '')
            });

            // If at the end of a row, remove any extra cells
            if (!cells[i + 1] || cells[i + 1].rowIdx !== rowIdx) {
                cellIdx++;
                while (trEl.cells[cellIdx]) {
                    trEl.deleteCell(cellIdx);
                }
            }
        }

        // Delete any extra rows
        rowIdx++;
        while (tbody.rows[rowIdx]) {
            tbody.deleteRow(rowIdx);
        }
    },

    afterLayout: function() {
        this.callParent();

        if (this.needsDivWrap()) {
            // set wrapper div width to match layed out item - see docs below
            Ext.Array.forEach(this.getLayoutItems(), function(item) {
                Ext.fly(item.el.dom.parentNode).setWidth(item.getWidth());
            });
        }
    },

    /**
     * @private
     * Determine the row and cell indexes for each component, taking into consideration
     * the number of columns and each item's configured colspan/rowspan values.
     * @param {Array} items The layout components
     * @return {Array} List of row and cell indexes for each of the components
     */
    calculateCells: function(items) {
        var cells = [],
            rowIdx = 0,
            colIdx = 0,
            cellIdx = 0,
            totalCols = this.columns || Infinity,
            rowspans = [], //rolling list of active rowspans for each column
            i = 0, j,
            len = items.length,
            item;

        for (; i < len; i++) {
            item = items[i];

            // Find the first available row/col slot not taken up by a spanning cell
            while (colIdx >= totalCols || rowspans[colIdx] > 0) {
                if (colIdx >= totalCols) {
                    // move down to next row
                    colIdx = 0;
                    cellIdx = 0;
                    rowIdx++;

                    // decrement all rowspans
                    for (j = 0; j < totalCols; j++) {
                        if (rowspans[j] > 0) {
                            rowspans[j]--;
                        }
                    }
                } else {
                    colIdx++;
                }
            }

            // Add the cell info to the list
            cells.push({
                rowIdx: rowIdx,
                cellIdx: cellIdx
            });

            // Increment
            for (j = item.colspan || 1; j; --j) {
                rowspans[colIdx] = item.rowspan || 1;
                ++colIdx;
            }
            ++cellIdx;
        }

        return cells;
    },

    /**
     * @private
     * Return the layout's table element, creating it if necessary.
     */
    getTable: function() {
        var table = this.table;
        if (!table) {
            table = this.table = this.getTarget().createChild(
                Ext.apply({
                    tag: 'table',
                    role: 'presentation',
                    cls: this.tableCls,
                    cellspacing: 0, //TODO should this be specified or should CSS handle it?
                    cn: {tag: 'tbody'}
                }, this.tableAttrs),
                null, true
            );
        }
        return table;
    },

    /**
     * @private
     * Opera 10.5 has a bug where if a table cell's child has box-sizing:border-box and padding, it
     * will include that padding in the size of the cell, making it always larger than the
     * shrink-wrapped size of its contents. To get around this we have to wrap the contents in a div
     * and then set that div's width to match the item rendered within it afterLayout. This method
     * determines whether we need the wrapper div; it currently does a straight UA sniff as this bug
     * seems isolated to just Opera 10.5, but feature detection could be added here if needed.
     */
    needsDivWrap: function() {
        return Ext.isOpera10_5;
    }
});
