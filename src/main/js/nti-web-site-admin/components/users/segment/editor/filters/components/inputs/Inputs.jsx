import { InputRegistry } from './common';

import './Course';
import './String';

export function getInput(name) {
	return InputRegistry.getItem(name);
}
