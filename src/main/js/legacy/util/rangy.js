
if (typeof document !== 'undefined') {
    const rangy = require('rangy');
    require('rangy/lib/rangy-textrange');

    rangy.init();

    module.exports = exports = rangy;
}