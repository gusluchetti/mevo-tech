import { relations } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const buyers = sqliteTable("buyers", {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	cpf: text().notNull(),
});

export const orders = sqliteTable("orders", {
	id: integer().primaryKey({ autoIncrement: true }),
	buyer_id: integer()
		.references(() => buyers.id)
		.notNull(),
	status: text({
		enum: ["pendente", "faturado", "cancelado", "na entrega", "entregue"],
	}).default("pendente"),
});

export const orderRelations = relations(orders, ({ one, many }) => ({
	buyers: one(buyers, {
		fields: [orders.buyer_id],
		references: [buyers.id],
	}),
	items: many(items, {
		relationName: "order_items",
	}),
}));

export const items = sqliteTable("items", {
	id: integer().primaryKey({ autoIncrement: true }),
	order_id: integer()
		.references(() => orders.id)
		.notNull(),
	name: text().notNull(),
	quantity: integer().notNull(),
	price: integer().notNull(),
});

export const itemRelations = relations(items, ({ one }) => ({
	orders: one(orders, {
		fields: [items.order_id],
		references: [orders.id],
		relationName: "order_items",
	}),
}));
