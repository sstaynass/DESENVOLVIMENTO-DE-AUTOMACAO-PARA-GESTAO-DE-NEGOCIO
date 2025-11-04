import { Browser, Builder, type WebDriver } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import edge from "selenium-webdriver/edge";

type BrowserType = "chrome" | "edge";

/**
 * Factory para criar instâncias de WebDriver
 * Permite paralelismo removendo o padrão Singleton
 */
export class SeleniumDriverFactory {
	/**
	 * Cria uma nova instância do WebDriver
	 * @param browser - Tipo de navegador ("chrome" ou "edge")
	 * @param optionsArg - Argumentos para as opções do navegador
	 * @returns Nova instância do WebDriver
	 */
	public static createDriver(
		browser: BrowserType = "chrome",
		optionsArg: string = "--start-fullscreen",
	): WebDriver {
		if (browser === "chrome") {
			const options = new chrome.Options();
			options.addArguments(optionsArg);
			return new Builder()
				.forBrowser(Browser.CHROME)
				.setChromeOptions(options)
				.build();
		} else if (browser === "edge") {
			const options = new edge.Options();
			options.addArguments(optionsArg);
			return new Builder()
				.forBrowser(Browser.EDGE)
				.setEdgeOptions(options)
				.build();
		} else {
			throw new Error(`Browser inválido. Forneça "chrome" ou "edge"`);
		}
	}

	/**
	 * Fecha o driver de forma segura
	 * @param driver - Instância do WebDriver a ser fechada
	 */
	public static async closeDriver(driver: WebDriver | null | undefined): Promise<void> {
		if (driver) {
			try {
				await driver.quit();
			} catch (error) {
				console.error("Erro ao fechar driver:", error);
				// Não relança o erro para não interromper o fluxo
			}
		}
	}
}

