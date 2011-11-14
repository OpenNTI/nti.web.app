Ext.define('NextThought.view.windows.ClassRoomChooser', {
	extend: 'Ext.window.Window',
	alias : 'widget.classroom-chooser',

	title: 'Classroom:',
	width: 450,
	height: 350,
	closable: false,
	constrain: true,
	layout: 'fit',
	items: {
		border: false
	},
	modal: true
});
