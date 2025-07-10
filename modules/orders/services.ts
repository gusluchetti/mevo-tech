import type { Request, Response } from "express";
import type { CompleteOrder, OrderStatus } from "../../db/order.models";
import type { NewOrderParams } from "./dto";
import { db } from "../../db";
import { requestMotoboy } from "../external";

export class OrderService {
  createOrder = (req: Request, res: Response) => {
    const newOrderParams: NewOrderParams = req.body;
    const { buyer_id, items } = newOrderParams;

    const query = db.query('insert into orders(buyer_id) values ($buyer_id);')
    query.all({ $buyer_id: buyer_id })

    const joinedQuery = db.query('select * from orders join buyers on orders.buyer_id = buyers.id;')
    const joinedOrders = joinedQuery.all()
    const singleJoinedOrder: any = joinedOrders[0]

    let newItems: any[] = []

    items.forEach(item => {
      const query = db.query(`
      insert into items(order_id, name, quantity, price)
      values (?1, ?2, ?3, ?4);`)
      const newItem = query.all(singleJoinedOrder?.id, item.name, item.quantity, item.price)
      newItems.push(newItem)
    })

    const response: CompleteOrder = {
      id: singleJoinedOrder.id,
      buyer: {
        name: singleJoinedOrder.name,
        cpf: singleJoinedOrder.cpf,
      },
      items: newItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
      status: singleJoinedOrder.status
    }

    res.json(response);
  }

  updateOrder = async (req: Request, res: Response) => {
    const { id: orderId, status: newStatus } = req.params;
    const isValidStatus = (x: any): x is OrderStatus => !!newStatus && newStatus?.includes(x);
    if (!isValidStatus) {
      res.status(400).json('Status inválido')
    }
    const orders: any[] = db.query('select * from orders where orders.id = $id;').all({
      $id: orderId!
    })
    const order = orders[0]
    if (order.status === "entregue") {
      res.status(204).send(`Status == "entregue", nenhuma modificação permitida`)
      return;
    }

    if (newStatus === "faturado") {
      try {
        const promise = await requestMotoboy(orderId!)
      } catch (error) {
        res.status(400).send('Agendamento da entrega falhou.')
        return;
      }
    }

    const updateOrder = db.query('update orders set status = $status where id = $id').all({
      $id: orderId!,
      $status: newStatus!
    })

    res.json(updateOrder);
  }

  getOrders = (req: Request, res: Response) => {
    const query = db.query('select * from orders;')
    const result = query.all();

    res.json(result);
  }

  getOrderById = (req: Request, res: Response) => {
    const orderId = req.params.id;
    const joinedOrders = db.query('select * from orders join buyers on orders.buyer_id = buyers.id where orders.id = $id;').all({
      $id: orderId!
    })
    const singleJoinedOrder: any = joinedOrders[0]
    const orderItems: any[] = db.query('select * from items where order_id = $order_id').all({ $order_id: orderId! })

    const response: CompleteOrder = {
      id: singleJoinedOrder.id,
      buyer: {
        name: singleJoinedOrder.name,
        cpf: singleJoinedOrder.cpf,
      },
      items: orderItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
      status: singleJoinedOrder.status
    }
    res.json(response);
  }
}
