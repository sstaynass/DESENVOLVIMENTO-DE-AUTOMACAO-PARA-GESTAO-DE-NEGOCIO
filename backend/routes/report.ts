import type { FastifyInstance } from "fastify";
import fs from "fs/promises";
import path from "path";

export async function acessReport(app: FastifyInstance) {
	// Aceitar tanto GET quanto POST para compatibilidade
	app.get("/report", async (request, reply) => {
		try {
			const filePath = path.resolve(__dirname, "../class/json/report.json");
			const data = await fs.readFile(filePath, "utf-8");
			const json = JSON.parse(data);
			// Garantir que sempre retorne um array para compatibilidade
			const result = Array.isArray(json) ? json : (json ? [json] : []);
			return reply.status(200).send(result);
		} catch (err) {
			request.log.error(err);
			// Se arquivo não existir, retornar array vazio
			if ((err as NodeJS.ErrnoException).code === "ENOENT") {
				return reply.status(200).send([]);
			}
			return reply.status(500).send({ error: "Erro ao ler relatório" });
		}
	});

	app.post("/report", async (request, reply) => {
		try {
			const filePath = path.resolve(__dirname, "../class/json/report.json");
			const data = await fs.readFile(filePath, "utf-8");
			const json = JSON.parse(data);
			// Garantir que sempre retorne um array para compatibilidade
			const result = Array.isArray(json) ? json : (json ? [json] : []);
			return reply.status(200).send(result);
		} catch (err) {
			request.log.error(err);
			// Se arquivo não existir, retornar array vazio
			if ((err as NodeJS.ErrnoException).code === "ENOENT") {
				return reply.status(200).send([]);
			}
			return reply.status(500).send({ error: "Erro ao ler relatório" });
		}
	});
}
