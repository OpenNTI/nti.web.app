// Config stubbing
var _AppConfig = {
    userObject: null,//construct this mock user on launch
    server: {
        host: 'test:',
        data: '/dataserver/',
        library: '/library/library.json',
        username: 'test@nextthought.com',
        password: 'irrelevant'
    }
};

//mock socketio
var io = {
    connect: function(){ return {
        on: function(){},
        emit: function(){},
        disconnect: function(){},
        onPacket: function(){},
        socket: {
            disconnectSync: function(){}
        }
    }}
};

Ext.application({
    name: 'NextThought',
    appFolder: 'src/main/NextThought',

    controllers: [
        'State',
        'Chat',
        'Account',
        'Annotations',
        'Application',
        'FilterControl',
        'Groups',
        'Home',
        'Session',
        'Modes',
        'ObjectExplorer',
        'Reader',
        'Search',
        'Stream'
    ],

    launch: function() {
        NextThought.isDebug = true;
        NextThought.phantomRender = true;
        Ext.JSON.encodeDate = encodeDate;

        hookAjax();

        //include the tests in the test.html head
        jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
        jasmine.getEnv().execute();
    }
});








function hookAjax()
{
    Ext.Ajax.request_forReal = Ext.Ajax.request;
    Ext.Ajax.request = function test_ajax(o){
        if(/^test:/i.test(o.url)){
            o.url = o.url.replace(/^test:/i, './app-test/mock');
        }
        this.request_forReal.apply(this, arguments);
    };
}