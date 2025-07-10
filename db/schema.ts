import { relations } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core"

export const buyers = sqliteTable('buyers', {
	id: integer().primaryKey(),
	name: text().notNull(),
	cpf: text().notNull()
});

export const orders = sqliteTable('orders', {
	id: integer().primaryKey(),
	buyer_id: integer().references(() => buyers.id).notNull(),
	status: text({
		enum: [
			'pendente',
			'faturado',
			'cancelado',
			'na entrega',
			'entregue',
		]
	}).notNull().default('pendente')
})

export const orderRelations = relations(orders, ({ one, many }) => ({
	buyers: one(buyers, {
		fields: [orders.buyer_id],
		references: [buyers.id],
	}),
	items: many(items, {
		relationName: 'order_items'
	})
}))

export const items = sqliteTable('items', {
	id: integer().primaryKey(),
	order_id: integer().references(() => orders.id).notNull(),
	name: text().notNull(),
	quantity: integer().notNull(),
	price: integer().notNull()
})
