import { create, act } from 'react-test-renderer';

import LastActivity from '../LastActivity';

/* eslint-env jest */
describe('Site admin user course enrollment overview last activity widget', () => {
	test('Basic render test', async () => {
		const enrollment = {
			getLastSeenTime: () => new Date('10/30/2017'),
		};

		let cmp;
		act(() => {
			cmp = create(<LastActivity enrollment={enrollment} />);
		});

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
		cmp.unmount();
	});
});
