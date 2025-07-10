export const requestMotoboy = (orderId: string): Promise<void> => {
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

