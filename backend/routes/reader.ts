import type { FastifyInstance } from "fastify";
import { Primitive } from "../class/primitive";
import { RetryToolkitWithAsyncReport } from "../class/retryToolkitWithReport";
import { ScreenshotService } from "../class/screenshotService";

async function processarNotasFiscais(primitive: Primitive) {
	// Verificar se o driver está ativo
	if (!primitive.isDriverActive() || !primitive.driver) {
		throw new Error("Driver não está inicializado!");
	}

	// URL de exemplo para teste - você pode substituir por uma URL real de nota fiscal
	const urlNotaFiscal = "https://docmanagement.com.br/wp-content/uploads/2013/06/cupom-fiscal.jpg";
	
	// Criar serviço de screenshot usando o driver do primitive
	const screenshotService = new ScreenshotService(primitive.getDriver());
	
	console.log("Processando notas fiscais...");
	console.log(`Acessando URL: ${urlNotaFiscal}`);
	
	// Capturar screenshot e extrair texto usando OCR
	const textoExtraido = await screenshotService.captureAndExtractText(urlNotaFiscal, "por");
	
	console.log("\n📄 Texto extraído da nota fiscal:");
	console.log("---------------------------------------------------");
	console.log(textoExtraido.trim());
	console.log("---------------------------------------------------");
	
	// Aqui você pode processar o texto extraído conforme necessário
	// Por exemplo, extrair valores, datas, CNPJ, etc.
	
	// Aguardar um pouco para garantir que tudo foi processado
	await primitive.setSleep(1000);
	
	return textoExtraido;
}

export async function acessReader(app: FastifyInstance) {
	app.post("/reader", async (request) => {
		const body = request.body as { rotinas?: string[] } | undefined;
		const rotinas = body?.rotinas || [];

		// Usar apenas o retry, que já é um Primitive (herda de RetryToolkit que herda de Primitive)
		const retry = new RetryToolkitWithAsyncReport();

		try {
			retry.setTaskName("registro automatizado de notas fiscais");

			// Processar notas fiscais usando OCR
			const textoExtraido = await retry.retryable(
				() => processarNotasFiscais(retry),
				3,
				3000,
				"processamento das notas fiscais",
			);
			
			retry.saveReport();

			return { 
				message: "Registro de notas fiscais realizado com sucesso!",
				textoExtraido: textoExtraido 
			};
		} catch (error) {
			console.error("Erro ao processar notas fiscais:", error);
			retry.saveReport();
			throw error;
		} finally {
			// Garante que o driver seja fechado mesmo em caso de erro
			await retry.setDriverClose();
		}
	});
}
