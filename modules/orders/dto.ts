import z from "zod";

export const OrderIdParam = z.object({
	id: z.coerce.number(),
});

export const NewOrderParam = z.object({
	buyer_id: z.number(),
	items: z.array(
		z.object({
			name: z.string(),
			quantity: z.number(),
			price: z.number(),
		}),
	),
});

const OrderStatusSchema = z.enum([
	"pendente",
	"faturado",
	"cancelado",
	"na entrega",
	"entregue",
]);

export const UpdateOrderParam = z.object({
	id: z.coerce.number(),
	status: OrderStatusSchema,
});
