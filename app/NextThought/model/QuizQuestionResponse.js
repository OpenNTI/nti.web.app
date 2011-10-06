Ext.data.Types.QUIZ_QUESTION = {
    type: 'QuizQuestion',
    convert: function(o) {
        return ParseUtils.parseItems([o])[0];
    },
    sortType: function(v) {
        console.log('sort by QuizQuestion:',arguments);
        return '';
    }
};

Ext.define('NextThought.model.QuizQuestionResponse', {
    extend: 'NextThought.model.Base',
    requires: [
        'NextThought.model.QuizQuestion'
    ],
    fields: [
        { name: 'Assessment', type: 'boolean' },
        { name: 'Class', type: 'string' },
        { name: 'Question', type: Ext.data.Types.QUIZ_QUESTION },
        { name: 'Response', type: 'string' }
    ],
    proxy: {
        type: 'memory'
    },
    getModelName: function() {
        return 'QuizQuestionResponse';
    }
});