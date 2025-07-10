import type { FilteredItem } from "./item.models";

export type Order = {
	id: number;
	buyer_id: number;
	status: "pendente" | "faturado" | "cancelado" | "na entrega" | "entregue";
};
export type OrderStatus = Order["status"];

export type CompleteOrder = {
	id: number;
	buyer: { name: string; cpf: string };
	items: FilteredItem[];
	status: OrderStatus;
};
