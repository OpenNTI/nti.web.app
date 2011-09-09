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
    if (!/submit/i.test(Ext.get('submit').dom.innerHTML)){
        NTIResetQuiz();
        return;
    }

    var s = _AppConfig.server,
        ntiid = Ext.query('meta[name=NTIID]')[0].getAttribute('content'),
        h = s.host,
        d = s.data,
        url = h+d+'users/'+s.username+'/quizresults/'+ntiid,
        vp = Ext.getCmp('viewport').getEl();

    vp.mask('Grading...');

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

    Ext.Ajax.request({
        url: url,
        jsonData: Ext.JSON.encode(data),
        method: 'POST',
        problems: problems,
        callback: function() {
            vp.unmask();
        },
        failure: function(){
            console.log('FAIL', arguments);
        },
        success: NTISubmitSuccess
    });


    console.log(data);
}

function togglehint(event) {
	Ext.get(event.target.nextSibling).toggleCls("hidden");
	return false;
}


function NTISubmitSuccess(r,req){
    var json = Ext.JSON.decode(r.responseText),
        p = UserDataLoader.parseItems([json])[0],
        qs = p.get('Items'),
        vp = Ext.getCmp('viewport'),
        reader = vp.getActive().getMainComponent();

    Ext.each(qs, function(qqr){
        var q = qqr.get('Question'),
            id = q.get('id'),
            p = req.problems[id],
            r = p.next('.result');

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

    reader.relayout();
    if (reader.scrollTo) reader.scrollTo(0);

    Ext.get('submit').update('Reset');


}

function NTIResetQuiz() {
    var vp = Ext.getCmp('viewport'),
        reader = vp.getActive().getMainComponent();

    Ext.get('submit').update('Submit');
    Ext.each(Ext.query('.worksheet-problems input'),function(v){
        var id = v.getAttribute('id'),
            el = Ext.get(v),
            p = el.up('.problem'),
            r = p.next('.result');
        v.value='';

        r.addCls('hidden');
        r.removeCls(['correct','incorrect']);
        r.down('.response').remove();
        r.down('.answer').remove();

        el.setVisibilityMode(Ext.Element.DISPLAY);
        el.show();
    });

    reader.relayout();
    if (reader.scrollTo) reader.scrollTo(0);
}