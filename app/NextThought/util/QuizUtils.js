
Ext.define('NextThought.util.QuizUtils', {
    requires: [],
    alternateClassName: 'QuizUtils',
    statics: {

        submitAnswers: function(){
            var s = _AppConfig.server,
                h = s.host,
                d = s.data,
                problems = {},
                data = {},
                ntiid = Ext.query('meta[name=NTIID]')[0].getAttribute('content'),
                url = h+d+'users/'+s.username+'/quizresults/'+ntiid,
                vp = Ext.getCmp('viewport').getEl();

            vp.mask('Grading...');

            Ext.each(
                Ext.query('.worksheet-problems input'),
                function(v){
                    var id = v.getAttribute('id'),
                        el = Ext.get(v);
                    data[id] = v.value;
                    problems[id] = el.up('.problem');

                    el.setVisibilityMode(Ext.Element.DISPLAY);
                    el.hide();
                },
                this);

            Ext.Ajax.request({
                url: url,
                jsonData: Ext.JSON.encode(data),
                method: 'POST',
                problems: problems,
                scope: this,
                callback: function(){ vp.unmask(); },
                failure: function(){
                    //TODO: hook up to error handling
                    console.log('FAIL', arguments);
                },
                success: this.submitSuccess
            });
        },


        submitSuccess: function(r,req){
            var json = Ext.JSON.decode(r.responseText),
                p = UserDataLoader.parseItems([json])[0],
                vp = Ext.getCmp('viewport'),
                reader = vp.getActive().getMainComponent(),
                mathCls = 'mathjax tex2jax_process ';

            Ext.each(
                p.get('Items'),
                function(qqr){
                    var q = qqr.get('Question'),
                        id = q.get('id'),
                        p = req.problems[id],
                        r = p.next('.result');

                    r.removeCls('hidden');
                    r.addCls((qqr.get('Assessment')?'':'in')+'correct');

                    r.createChild({
                        tag : 'div',
                        html: 'Your response: \\('+qqr.get('Response')+'\\)',
                        cls: mathCls+'response'
                    });

                    r.createChild({
                        tag : 'div',
                        html: 'Correct answer(s): '+q.get('Answers').join(', ').replace(/\$(.+?)\$/ig,'\\($1\\)'),
                        cls: mathCls+'answer'
                    });
                });

            try{
                MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
            }
            catch( e ){
                console.log('No MathJax? ',e);
            }

            if (reader.scrollTo){
                reader.relayout();
                reader.scrollTo(0);
            }

            Ext.get('submit').update('Reset');
        },

        resetQuiz: function() {
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

    }
});


/*********************************************************
 * Global functions called by content in the Reader panel
 */

function NTISubmitAnswers(){
    if (!/submit/i.test(Ext.get('submit').dom.innerHTML)){
        QuizUtils.resetQuiz();
        return;
    }

    QuizUtils.submitAnswers();
}


function togglehint(event) {
    Ext.get(event.target.nextSibling).toggleCls("hidden");
    return false;
}