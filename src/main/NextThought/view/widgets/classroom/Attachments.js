Ext.define('NextThought.view.widgets.classroom.Attachments', {
	extend:'Ext.panel.Panel',
    alias: 'widget.classroom-attachments-view',
    requires: [
    ],

    cls: 'classroom-attachments-view',
    border: true,
    defaults: {border: false},
    title: 'Attachments',

    layout: 'vbox',

    items: [
        {html: 'Monet.jpg'},
        {html: 'NYC-Arts.ppt'},
        {html: 'Leonardo DiVinchi.pdf'},
        {html: 'Some other attachment.xls'}
    ]
});
