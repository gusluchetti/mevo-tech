import express from "express";
import { OrderService } from "./modules/orders/services";

const app = express();
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
const port = 8080;

const orderService = new OrderService();

app.get("/order", orderService.getOrders);
app.get("/order/:id", orderService.getOrderById);
app.post("/order", orderService.createOrder);
app.put("/order/:id/:status", orderService.updateOrder);

app.listen(port, () => {
	console.log(`Listening on port ${port}...`);
});
