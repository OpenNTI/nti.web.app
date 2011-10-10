Ext.define('NextThought.controller.Home', {
    extend: 'Ext.app.Controller',

    models: [
        'Highlight',
        'Note',
        'QuizQuestion',
        'QuizQuestionResponse',
        'QuizResult',
        'Title'
    ],

    views: [
        'content.Home',
        'modes.Home',
        'widgets.main.ProfileHeader',
        'widgets.LibraryView'
    ],

    refs: [
        { ref: 'sessionInfo', selector: 'session-info' }
    ],

    init: function() {
        this.control({
            'profile-header':{
                'edit': function(){
                    this.getSessionInfo().fireEvent('account');
                }
            },
            'home-mode-container library-view':{
                'itemdblclick':function(a, rec){
                    VIEWPORT.fireEvent('navigate', rec, rec.get('href'));
                },
                'selectionchange': function(a, sel){}
            }
        });
    }
});