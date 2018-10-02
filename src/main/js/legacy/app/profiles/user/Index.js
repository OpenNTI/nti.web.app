const {isFlag} = require('@nti/web-client');

if (isFlag('use-react-profile')) {
	require('./ReactProfile');
} else {
	require('./ExtProfile');
}
