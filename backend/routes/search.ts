import type { FastifyInstance } from "fastify";
import { Primitive } from "../class/primitive";
import { RetryToolkitWithAsyncReport } from "../class/retryToolkitWithReport";

async function preencheDados(primitive: Primitive){
	const dataAtual = new Date();
	const dia = String(dataAtual.getDate()).padStart(2, '0');
	const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
	const ano = dataAtual.getFullYear();

	const dataFormatada = `${dia}/${mes}/${ano}`; // '27/09/2025'
	let dados = ["S25", "João Pedro", "Eletronico", "kg", "Creme", "Alumínio", "Samsung","0.167", "25", dataFormatada ,"Koreia do Sul"];
		 
		for (let i = 0; i < dados.length; i++) {
			
			await primitive.setSleep()

			const campo = await primitive.setFind(
				'paginaPrincipal.campos',
				'one',
				5000,
				(baseSelector: string) => baseSelector.replace(/INDEX/g, (i + 1).toString())
				);
			await campo.sendKeys(dados[i] ?? "");
		}
}

export async function acessSite(app: FastifyInstance) {
	app.post("/search", async () => {
		const primitive = new Primitive();
		const retry = new RetryToolkitWithAsyncReport();

		retry.setTaskName("preenchimento automatizado do formulário");

		await retry.retryable(
			() => primitive.setSite("https://docs.google.com/forms/d/1s_-oo76aKv9DvrEyQequ2XD1Trqm9nQmlft_z_7YGjI/edit"),
			3,
			3000,
			"acesso ao site do forms",
		);
		await retry.retryable(
			() => preencheDados(primitive),
			3,
			3000,
			"preenchimento dos dados",
		);
		await retry.retryable(
			() => primitive.setClick("paginaPrincipal.botao"),
			3,
			3000,
			"envio do formulário",
		);
		
		retry.saveReport();

		return { message: "Scraping realizado com sucesso!" };
	});
}
