Ext.Loader.setPath('Ext.ux', 'extjs/examples/ux');
Ext.require([
    'Ext.data.*'
]);

var CENTER_WIDTH = 768,
    MIN_SIDE_WIDTH = 216,
    MIN_WIDTH = 1200;


function resizeBlocker(w, h, e){
    var i = !!(w<MIN_WIDTH),
        b = Ext.getBody(),
        m = b.isMasked();

    if(i && !m){
        b.mask("Your browser window is too narrow","viewport-too-small");
    }
    else if(!i && m){
        b.unmask();
    }
}





Ext.application({
    name: 'NextThought',
    appFolder: 'app/NextThought',

    controllers: [
        'Login',
        'Modes',
        'Reader',
        'Stream',
        'Groups',
        'FilterControl',
        'Annotations',
        'ObjectExplorer',
        'Search',
        'Application'
    ],

    launch: function() {
//        Ext.FocusManager.enable();
        NextThought.isDebug = true;
        setTimeout(clearMask, 100);

        Ext.create('NextThought.view.LoginWindow',{callback: appStart});


        function appStart(){

            try{
                NextThought.modeSwitcher = Ext.create('NextThought.view.navigation.ModeSwitcher',{});
                if(!NextThought.modeSwitcher){
                    console.log('failed to load switer');
                    Ext.getBody().mask('load failed');
                    return;
                }

                Ext.EventManager.onWindowResize(resizeBlocker);
                Ext.create('NextThought.view.Viewport',{}).getEl();
                NextThought.librarySource.load();
            }
            catch(e){
                console.log(e, e.message, e.stack);
            }
        }

        function clearMask(){
            Ext.get('loading').remove();
            Ext.get('loading-mask').fadeOut({remove:true});
            resizeBlocker(Ext.Element.getViewWidth());
        }
    }
});


Ext.onReady(function(){
    if(Ext.isIE){
        Ext.panel.Panel.override({
            render: function(){
                this.callOverridden(arguments);
                var d=this.el.dom;
                d.firstChild.unselectable = true;
                d.unselectable = true;
            }
        });
    }
    Ext.Ajax.timeout==60000;
    Ext.Ajax.on(
        'beforerequest', function f(connection,options){
            if(options&&options.async===false){
                var loc = '';
                try {
                    loc = printStackTrace()[7];
                }
                catch (e) {
                    loc = e.stack;
                }

                console.log('WARNING: Synchronous Call in: ', loc, ' Options:', options );
            }
        }
    );
});






window.onpopstate = function(e) {
    var s = e?e.state:null;
    if(!s){
        //console.log(e);
        return;
    }

    console.log('History Popped, State being restored: ',e.state);

    if(s.path){
        var r = Ext.getCmp('myReader');
        if(!r ){
            console.log('the reader component was not found');
            return;
        }
        r._restore(s);
    }
};





function NTISubmitAnswers(){
    var
        s = _AppConfig.server,
        ntiid = Ext.query('meta[name=NTIID]')[0].getAttribute('content'),
        h = s.host,
        d = s.data,
        url = h+d+'users/'+s.username+'/quizresults/'+ntiid,
        vp= Ext.getCmp('viewport');

    vp.getEl().mask('Grading...');

    var problems = {},
        data = {};
    Ext.each(Ext.query('.worksheet-problems input'),function(v){
        var id = v.getAttribute('id'),
            el = Ext.get(v);
        data[id] = v.value;
        problems[id] = el.up('.problem');

        el.setVisibilityMode(Ext.Element.DISPLAY);
        el.hide();
    });

    var postData = Ext.JSON.encode(data)    ;

    Ext.Ajax.request({
        url: url,
        jsonData: postData,
        method: 'POST',
        callback: function() {
            vp.getEl().unmask();
        },
        failure: function(){
            console.log('FAIL', arguments);
        },
        success: function(r){
            var json = Ext.JSON.decode(r.responseText),
                p = UserDataLoader.parseItems([json])[0],
                qs = p.get('Items');

            Ext.each(qs, function(qqr){
                var q = qqr.get('Question'),
                    id = q.get('id'),
                    p = problems[id],
                    r = p.next('.result');

//               console.log(q, id, p, r);
                r.removeCls('hidden');
                r.addCls(qqr.get('Assessment') ? 'correct' : 'incorrect');

                r.createChild({
                    tag : 'div',
                    html: 'Your response: \\(' + qqr.get('Response')+'\\)',
                    cls: 'mathjax tex2jax_process response'
                });

                r.createChild({
                    tag : 'div',
                    html: 'Correct answer(s): ' + q.get('Answers').join(', ').replace(/\$(.+?)\$/ig, '\\($1\\)'),
                    cls: 'mathjax tex2jax_process answer'
                });
            });

            try{
                //Have mathjax display the new math
                MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
            }catch( err ){
                console.log(err);
            }

            vp.getActive().getMainComponent().relayout();
//           console.log('YOU GO GIRL!', json, p);
        }
    });


    console.log(data);
}

function togglehint(event) {
	Ext.get(event.target.nextSibling).toggleCls("hidden");
	return false;
}