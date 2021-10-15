import { Cell } from './Cell';

TargetColumn.Name = 'Target';
export function TargetColumn({ item }) {
	return <Cell>{item.Target}</Cell>;
}
