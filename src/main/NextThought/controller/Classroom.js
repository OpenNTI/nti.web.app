Ext.define('NextThought.controller.Classroom', {
    extend: 'Ext.app.Controller',
    requires: [
    ],

    models: [
    ],

    views: [
        'content.Classroom',
        'widgets.classroom.LiveDisplay',
        'widgets.classroom.Management',
        'widgets.classroom.Moderation'
    ]



});