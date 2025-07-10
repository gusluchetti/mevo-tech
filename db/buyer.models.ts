export const CREATE_BUYERS = `
CREATE TABLE buyers(
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL
);`

export type Buyer = {
	id: number,
	name: string,
	cpf: string
}
