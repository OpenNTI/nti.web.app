import { ComponentRegistry } from './Registry';

import './EmptySet';
import './Group';
import './Rule';

export const getCmp = type => {
	return ComponentRegistry.getInstance().getItem(type);
};
