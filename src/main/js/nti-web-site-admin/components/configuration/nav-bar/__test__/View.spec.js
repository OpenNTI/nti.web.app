import renderer, { act } from 'react-test-renderer';

import View from '../View';

/* eslint-env jest */
//TODO: make this more useful
describe.skip('Site admin advanced nav bar test', () => {
	test('Basic render test', async () => {
		let cmp;
		act(() => {
			cmp = renderer.create(<View />);
		});

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
