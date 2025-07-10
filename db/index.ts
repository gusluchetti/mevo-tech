import { Database } from "bun:sqlite";
import { CREATE_BUYERS } from "./buyer.models";
import { CREATE_ORDERS } from "./order.models";
import { CREATE_ITEMS } from "./item.models";

export const db = new Database(":memory:");

db.run(CREATE_BUYERS);
db.run(CREATE_ORDERS);
db.run(CREATE_ITEMS);

db.run(`insert into buyers (name, cpf) values ('gustavo', '123');`)
