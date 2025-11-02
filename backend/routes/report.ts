import type { FastifyInstance } from "fastify";
import fs from "fs/promises";
import path from "path";

export async function acessReport(app: FastifyInstance) {
	app.post("/report", async (request, reply) => {
		try {
			const filePath = path.resolve(__dirname, "../class/json/report.json"); // Ajuste conforme local
			const data = await fs.readFile(filePath, "utf-8");
			const json = JSON.parse(data);
			return json;
		} catch (err) {
			request.log.error(err);
			reply.status(500).send({ error: "Erro ao ler relatório" });
		}
	});
}
