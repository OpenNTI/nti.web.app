
Ext.define('NextThought.util.QuizUtils', {
    requires: [],
    alternateClassName: 'QuizUtils',
    statics: {

        /**
         *
         * @param iterationCallback Optional - a function that takes three arguments: function(id, inputEl, containerEl)
         */
        getProblemElementMap: function(iterationCallback,scope){
            var problems = {};
             Ext.each(
                Ext.query('.worksheet-problems input'),
                function(v){
                    var id = v.getAttribute('id'),
                        el = Ext.get(v);

                    el.setVisibilityMode(Ext.Element.DISPLAY);
                    problems[id] = el.up('.problem');

                    if(iterationCallback){
                        iterationCallback.call(scope||this, id, el, problems[id]);
                    }
                },
                this);

            return problems;
        },

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

            problems = this.getProblemElementMap(
                function(id,v,c){
                    data[id] = v.getValue();
                    v.hide();
                },
                this);


            Ext.Ajax.request({
                url: url,
                jsonData: Ext.JSON.encode(data),
                method: 'POST',
                scope: this,
                callback: function(){ vp.unmask(); },
                failure: function(){
                    //TODO: hook up to error handling
                    console.log('FAIL', arguments);
                },
                success: function(r,req){
                    var quizResults = UserDataLoader.parseItems([ Ext.JSON.decode(r.responseText) ]);
                    this.showQuizResult(quizResults[0], problems);
                }
            });
        },


        showQuizResult: function(quizResult, problemsElementMap) {
            var mathCls = 'mathjax tex2jax_process ',
                ntiid = Ext.query('meta[name=NTIID]')[0].getAttribute('content'),
                problems = problemsElementMap || this.getProblemElementMap();

            if(ntiid != quizResult.get('ContainerId')){
                Ext.Error.raise('Result does not match the page!');
            }

            Ext.each(
                quizResult.get('Items'),
                function(qqr){
                    var q = qqr.get('Question'),
                        id = q.get('id'),
                        p = problems[id],
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

            try {
                MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
            }
            catch(e){
                console.log('No MathJax? ',e);
            }

            this.scrollUp();

            Ext.get('submit').update('Reset');
        },

        resetQuiz: function() {
            Ext.get('submit').update('Submit');

            this.getProblemElementMap(
                function(id,v,c){
                    v.dom.value='';
                    var r = c.next('.result');

                    r.addCls('hidden');
                    r.removeCls(['correct','incorrect']);

                    r.down('.response').remove();
                    r.down('.answer').remove();

                    v.show();
                },
                this);

            this.scrollUp();
        },


        scrollUp: function(){
            var p = Ext.getCmp('readerPanel');
            p.relayout();
            p.scrollTo(0);
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