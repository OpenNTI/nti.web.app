
import { Theme } from '@nti/web-commons';

import Mock from './Mock';

export default function Preview() {
	return (
		<Theme.Scope scope="library">
			<Mock />
		</Theme.Scope>
	);
}
