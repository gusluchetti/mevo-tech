export const CREATE_ITEMS = `CREATE TABLE items(
  id INTEGER PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL
);`

export type Item = {
  id: number,
  order_id: number,
  name: string,
  quantity: number,
  price: number
}

export type FilteredItem = { name: string; quantity: number, price: number }
