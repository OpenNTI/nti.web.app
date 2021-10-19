import { InputRegistry } from './common';

import './Course';

export function getInput(name) {
	return InputRegistry.getItem(name);
}
