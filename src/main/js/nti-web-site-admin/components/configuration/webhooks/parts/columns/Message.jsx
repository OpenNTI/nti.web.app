import { Cell } from './Cell';

MessageColumn.Name = 'Message';
export function MessageColumn({ item }) {
	return <Cell>{item.message}</Cell>;
}

MessageColumn.Placeholder = Cell.Placeholder;
