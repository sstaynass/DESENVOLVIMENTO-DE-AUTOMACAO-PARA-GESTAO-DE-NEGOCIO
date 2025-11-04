import cors from "@fastify/cors";
import fastify from "fastify";
import { acessSite } from "../routes/search";
import { acessReader } from "../routes/reader";
import { acessReport } from "../routes/report";

const app = fastify();

app.register(cors, { origin: "*" }); // Ajuste origem para produção

app.register(acessSite);
app.register(acessReader);
app.register(acessReport);

app.listen({ port: 3333 }).then(() => {
	console.log("Servidor backend rodando na porta 3333");
});
