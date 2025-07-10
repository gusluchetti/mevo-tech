import { Database } from "bun:sqlite";
import express from "express";

type Item = { name: string; quantity: number, price: number }

type NewOrderParams = {
  buyer_id: number,
  items: Item[];
}

type Order = {
  id: number,
  buyer: { name: string, cpf: string }
  items: Item[];
  status: 'pendente' | 'faturado' | 'cancelado' | 'na entrega' | 'entregue';
}

type OrderStatus = Order['status'];

const db = new Database(":memory:");

// init buyers table and add single buyer
db.run(`CREATE TABLE buyers(
	id INTEGER PRIMARY KEY,
	name TEXT NOT NULL,
	cpf TEXT NOT NULL
);`);
db.run(`insert into buyers (name, cpf) values ('gustavo', '123');`)

// create orders table
db.run(`CREATE TABLE orders(
	id INTEGER PRIMARY KEY,
	buyer_id INTEGER REFERENCES buyers(id),
	status TEXT NOT NULL DEFAULT 'pendente'
);`);

// create items table
db.run(`CREATE TABLE items(
	id INTEGER PRIMARY KEY,
	order_id INTEGER REFERENCES orders(id),
  name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  price INTEGER NOT NULL
);`);

const app = express();
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
const port = 8080;

const requestMotoboy = (orderId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const falhou = Math.random() < 0.25;
      if (falhou) {
        return reject(new Error(`[MOTOBOY] Falha ao agendar entrega do pedido ${orderId}`));
      }
      console.log(`[MOTOBOY] Pedido ${orderId} enviado para entrega.`);
      resolve();
    }, 1000); // simula delay de 1 segundo
  });
}

app.get("/order", (req, res) => {
  const query = db.query('select * from orders;')
  const result = query.all();

  console.log('orders: ', result)
  res.json(result);
});

app.get("/order/:id", (req, res) => {
  const orderId = req.params.id;
  const joinedOrders = db.query('select * from orders join buyers on orders.buyer_id = buyers.id where orders.id = $id;').all({
    $id: orderId
  })
  const singleJoinedOrder: any = joinedOrders[0]
  const orderItems: any[] = db.query('select * from items where order_id = $order_id').all({ $order_id: orderId })

  const response: Order = {
    id: singleJoinedOrder.id,
    buyer: {
      name: singleJoinedOrder.name,
      cpf: singleJoinedOrder.cpf,
    },
    items: orderItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
    status: singleJoinedOrder.status
  }
  console.log('single order:', response)
  res.json(response);
});

app.post("/order", (req, res) => {
  const newOrderParams: NewOrderParams = req.body;
  const { buyer_id, items } = newOrderParams;

  const query = db.query('insert into orders(buyer_id) values ($buyer_id);')
  query.all({ $buyer_id: buyer_id })

  const joinedQuery = db.query('select * from orders join buyers on orders.buyer_id = buyers.id;')
  const joinedOrders = joinedQuery.all()
  const singleJoinedOrder: any = joinedOrders[0]
  console.log(singleJoinedOrder)

  let newItems: any[] = []

  items.forEach(item => {
    console.log(item)
    const query = db.query(`
      insert into items(order_id, name, quantity, price)
      values (?1, ?2, ?3, ?4);`)
    console.log(query.toString())
    const newItem = query.all(singleJoinedOrder?.id, item.name, item.quantity, item.price)
    console.log(newItem)
    newItems.push(newItem)
  })
  console.log(newItems)

  const response: Order = {
    id: singleJoinedOrder.id,
    buyer: {
      name: singleJoinedOrder.name,
      cpf: singleJoinedOrder.cpf,
    },
    items: newItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
    status: singleJoinedOrder.status
  }

  console.log('created new order: ', response)
  res.json(response);
});

app.put("/order/:id/:status", async (req, res) => {
  const { id: orderId, status: newStatus } = req.params;
  const isValidStatus = (x: any): x is OrderStatus => newStatus.includes(x);
  if (!isValidStatus) {
    res.status(400).json('Status inválido')
  }
  const orders: any[] = db.query('select * from orders where orders.id = $id;').all({
    $id: orderId
  })
  const order = orders[0]
  if (order.status === "entregue") {
    res.status(204).send(`Status == "entregue", nenhuma modificação permitida`)
    return;
  }

  if (newStatus === "faturado") {
    try {
      const promise = await requestMotoboy(orderId)
    } catch (error) {
      res.status(400).send('Agendamento da entrega falhou.')
      return;
    }
  }

  const updateOrder = db.query('update orders set status = $status where id = $id').all({
    $id: orderId,
    $status: newStatus
  })

  res.json(updateOrder);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
