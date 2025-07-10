import express from "express";
import { OrderService } from "./modules/orders/services";
import { validateRequest } from "zod-express-middleware";
import { NewOrderParam, OrderIdParam, UpdateOrderParam } from "./modules/orders/dto";

const app = express();
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
const port = 8080;

const orderService = new OrderService();

app.get("/order", orderService.getOrders);
app.get("/order/:id", validateRequest({
	params: OrderIdParam
}), orderService.getOrderById);
app.post("/order", validateRequest({ body: NewOrderParam }), orderService.createOrder);
app.put("/order/:id/:status", validateRequest({
	params: UpdateOrderParam
}), orderService.updateOrder);

app.listen(port, () => {
	console.log(`Listening on port ${port}...`);
});
