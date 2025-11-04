import { By, until, type WebDriver, type WebElement } from "selenium-webdriver";
import { loadSelector } from "./loadSelector";
import { SeleniumDriverFactory } from "./seleniumDriverFactory";

export class Primitive {
	protected driver: WebDriver | null;
	private browser: "chrome" | "edge";
	private options: string;

	/**
	 * Cria uma nova instância do Primitive com seu próprio driver
	 * Permite paralelismo removendo o padrão Singleton
	 * @param browser - Tipo de navegador (padrão: "chrome")
	 * @param optionsArg - Argumentos para o navegador (padrão: "--start-fullscreen")
	 */
	constructor(browser: "chrome" | "edge" = "chrome", optionsArg: string = "--start-fullscreen") {
		try {
			this.browser = browser;
			this.options = optionsArg;
			this.driver = SeleniumDriverFactory.createDriver(browser, optionsArg);
		} catch (e) {
			console.error("Erro ao inicializar driver no Primitive:", e);
			throw e;
		}
	}

	public async setFind(
			pathSelector: string,
			size: "one" | "all",
			time: number = 10000,
			selectorBuilder?: (baseSelector: string) => string
	){
			try {
				if (!this.driver) {
					throw new Error("Driver não está inicializado!");
				}

				let selector = await loadSelector(pathSelector);

				const driver = this.driver;

				if (selector?.css && typeof selector.css === "string") {
					let cssSelector = selector.css;

					// Se receber builder, gera seletor final
					if (selectorBuilder) {
						cssSelector = selectorBuilder(cssSelector);
					}

					if (size === "one") {
						return driver.wait(until.elementLocated(By.css(cssSelector)), time);
					} else if (size === "all") {
						return driver.wait(until.elementsLocated(By.css(cssSelector)), time);
					}
				} else if (
					selector?.xpath &&
					typeof selector.xpath === "string"
				) {
					if (size === "one") {
						return driver.wait(
							until.elementLocated(By.xpath(selector.xpath)),
							time,
						);
					} else if (size === "all") {
						return driver.wait(
							until.elementsLocated(By.xpath(selector.xpath)),
							time,
						);
					}
				}

				throw new Error(
					"\n\r\rOs dados fornecidos são inválidos. Ajuste os parâmetros da função\n\r\r",
				);
			} catch (e) {
				throw new Error(String(e));
			}
		}


	public async setSite(site: string) {
		try {
			if (!this.driver) {
				throw new Error("Driver não está inicializado!");
			}
			await this.driver.get(site);
		} catch (e) {
			console.error("Erro ao abrir site:", e);
			throw e;
		}
	}

	public async setClick(pathSelector: string) {
		try {
			const element = await this.setFind(pathSelector, "one");
			if (!Array.isArray(element)) {
				await element.click();
			} else {
				throw new Error(
					"Elemento retornado é um array, esperado um único elemento.",
				);
			}
		} catch (e) {
			throw new Error(`Erro no setClick: ${String(e)}`);
		}
	}
	public async setWrite(pathSelector: string, text: string) {
		try {
			const element = await this.setFind(pathSelector, "one");
			if (!Array.isArray(element)) {
				await element.sendKeys(text)
			} else {
				throw new Error(
					"Elemento retornado é um array, esperado um único elemento.",
				);
			}
		} catch (e) {
			throw new Error(`Erro no setWrite: ${String(e)}`);
		}
	}

	/**
	 * Fecha o driver de forma segura
	 * Garante que o recurso seja liberado mesmo em caso de erro
	 */
	public async setDriverClose() {
		if (!this.driver) {
			console.warn("Driver não inicializado, nada a fechar.");
			return { message: "Driver não estava inicializado" };
		}
		const driverToClose = this.driver;
		this.driver = null; // Marca como null imediatamente para evitar uso após fechamento
		await SeleniumDriverFactory.closeDriver(driverToClose);
		return { message: "Driver fechado com sucesso\n\r\r" };
	}

	/**
	 * Verifica se o driver está ativo
	 */
	public isDriverActive(): boolean {
		return this.driver !== null && this.driver !== undefined;
	}

	/**
	 * Obtém o driver (para uso em serviços externos)
	 * @throws Error se o driver não estiver inicializado
	 */
	public getDriver(): WebDriver {
		if (!this.driver) {
			throw new Error("Driver não está inicializado!");
		}
		return this.driver;
	}
	public async setSleep(time: number = 1000) {
		if (!this.driver) {
			throw new Error("Driver não está inicializado!");
		}
		await this.driver.sleep(time)
	}
}
