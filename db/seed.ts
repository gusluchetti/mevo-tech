import { buyers } from "./schema";
import { db } from ".";

async function main() {
	await db.delete(buyers);
	await db.insert(buyers).values({ name: "Gustavo", cpf: "123" });
}
main();
