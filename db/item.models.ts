export type Item = {
	id: number;
	order_id: number;
	name: string;
	quantity: number;
	price: number;
};

export type FilteredItem = { name: string; quantity: number; price: number };
