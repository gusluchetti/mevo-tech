import type { Request, Response } from "express";
import type { CompleteOrder } from "../../db/order.models";
import type { NewOrderParam, OrderIdParam, UpdateOrderParam } from "./dto";
import { db } from "../../db";
import { requestMotoboy } from "../external";
import type {
	TypedRequestBody,
	TypedRequestParams,
} from "zod-express-middleware";
import { eq } from "drizzle-orm";
import { buyers, orders, items } from "../../db/schema";

export class OrderService {
	createOrder = async (
		req: TypedRequestBody<typeof NewOrderParam>,
		res: Response,
	) => {
		const newOrderParams = req.body;
		const { buyer_id, items: newItems } = newOrderParams;

		const [newOrder] = await db.insert(orders).values({ buyer_id }).returning();
		if (!newOrder) {
			res.status(500).send("pedido não pode ser salvo");
			return;
		}
		const [joinedOrder] = await db
			.select()
			.from(orders)
			.innerJoin(buyers, eq(orders.buyer_id, buyers.id))
			.where(eq(orders.id, newOrder.id));
		if (!joinedOrder) {
			res.status(500).send("pedido não pode ser salvo");
			return;
		}
		const itemsResult = await db
			.insert(items)
			.values(newItems.map((i) => ({ ...i, order_id: newOrder.id })))
			.returning();

		const response: CompleteOrder = {
			id: joinedOrder.orders.id,
			buyer: {
				name: joinedOrder.buyers.name,
				cpf: joinedOrder.buyers.cpf,
			},
			items: itemsResult.map((i) => ({
				name: i.name,
				quantity: i.quantity,
				price: i.price,
			})),
			status: joinedOrder.orders.status,
		};

		res.json(response);
	};

	updateOrder = async (
		req: TypedRequestParams<typeof UpdateOrderParam>,
		res: Response,
	) => {
		const { id: orderId, status: newStatus } = req.params;
		const existingOrder = await db
			.select()
			.from(orders)
			.where(eq(orders.id, orderId))
			.get();
		if (existingOrder?.status === "entregue") {
			res
				.status(204)
				.send(`Status == "entregue", nenhuma modificação permitida`);
			return;
		}

		if (newStatus === "faturado") {
			try {
				await requestMotoboy(orderId.toString());
			} catch (error) {
				console.error(error);
				res.status(400).send("Agendamento da entrega falhou.");
				return;
			}
		}

		const updateOrder = await db
			.update(orders)
			.set({ status: newStatus })
			.where(eq(orders.id, orderId))
			.returning()
			.get();

		res.json(updateOrder);
	};

	getOrders = async (_: Request, res: Response) => {
		const orderList = await db.select().from(orders);
		res.json(orderList);
	};

	getOrderById = async (
		req: TypedRequestParams<typeof OrderIdParam>,
		res: Response,
	) => {
		const orderId = req.params.id;

		const completeOrder = await db.query.orders.findFirst({
			with: {
				buyers: true,
				items: true,
			},
			where: eq(orders.id, orderId),
		});

		if (!completeOrder) {
			res.status(404).send("nenhum pedido com esse id encontrado");
			return;
		}

		const response: CompleteOrder = {
			id: completeOrder.id,
			buyer: {
				name: completeOrder.buyers.name,
				cpf: completeOrder.buyers.cpf,
			},
			items: completeOrder.items,
			status: completeOrder.status,
		};
		res.json(response);
	};
}
