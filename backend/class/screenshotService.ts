import { promises as fs } from "fs";
import { join } from "path";
import * as Tesseract from "tesseract.js";
import type { WebDriver } from "selenium-webdriver";

export class ScreenshotService {
	private driver: WebDriver;
	private screenshotPath: string;

	/**
	 * Cria uma nova instância do ScreenshotService
	 * @param driver - Instância do WebDriver a ser usada
	 * @param screenshotPath - Caminho onde salvar o screenshot (opcional)
	 */
	constructor(driver: WebDriver, screenshotPath?: string) {
		this.driver = driver;
		// Criar caminho único baseado em timestamp para evitar conflitos em paralelismo
		const timestamp = Date.now();
		this.screenshotPath = screenshotPath || join(__dirname, `../screenshots/screenshot_${timestamp}.png`);
	}

	/**
	 * Captura um screenshot da URL fornecida
	 * @param url - URL da página ou imagem para capturar
	 */
	public async captureScreenshot(url: string): Promise<void> {
		try {
			await this.driver.get(url);
			// Aguardar um pouco para garantir que a página carregou completamente
			await this.driver.sleep(2000);
			
			const screenshot = await this.driver.takeScreenshot();
			
			// Garantir que o diretório existe
			const screenshotDir = join(__dirname, "../screenshots");
			await fs.mkdir(screenshotDir, { recursive: true });
			
			// Salvar o screenshot
			await fs.writeFile(this.screenshotPath, screenshot, "base64");
			console.log(`Screenshot salva em: ${this.screenshotPath}`);
		} catch (error) {
			console.error("Erro ao capturar screenshot:", error);
			throw error;
		}
	}

	/**
	 * Extrai texto do screenshot usando OCR (Tesseract)
	 * @param language - Idioma para OCR (padrão: "eng")
	 * @returns Texto extraído da imagem
	 */
	public async extractTextFromScreenshot(language: string = "eng"): Promise<string> {
		try {
			console.log("Lendo imagem com OCR...");
			
			// Verificar se o arquivo existe
			try {
				await fs.access(this.screenshotPath);
			} catch {
				throw new Error(`Arquivo de screenshot não encontrado: ${this.screenshotPath}`);
			}

			const result = await Tesseract.recognize(this.screenshotPath, language, {
				logger: (m) => {
					if (m.status === "recognizing text") {
						console.log(`OCR Progress: ${(m.progress * 100).toFixed(0)}%`);
					}
				},
			});

			return result.data.text;
		} catch (error) {
			console.error("Erro ao extrair texto do screenshot:", error);
			throw error;
		}
	}

	/**
	 * Captura screenshot e extrai texto em uma única operação
	 * @param url - URL da página ou imagem para processar
	 * @param language - Idioma para OCR (padrão: "eng")
	 * @returns Texto extraído da imagem
	 */
	public async captureAndExtractText(url: string, language: string = "eng"): Promise<string> {
		await this.captureScreenshot(url);
		return await this.extractTextFromScreenshot(language);
	}
}

