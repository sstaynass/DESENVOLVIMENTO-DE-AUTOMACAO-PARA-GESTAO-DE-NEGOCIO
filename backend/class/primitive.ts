import { By, until, type WebDriver, type WebElement } from "selenium-webdriver";
import { loadSelector } from "./loadSelector";
import { seleniumSingleton } from "./seleniumSingleton";

export class Primitive {
	protected driver: WebDriver;
	constructor() {
		try {
			this.driver = seleniumSingleton
				.getInstance("chrome", "--start-fullscreen")
				.getDriver();
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

	public async setDriverClose() {
		if (!this.driver) {
			throw new Error("Driver não inicializado!");
		}
		await this.driver.quit(); // ✅ fecha o navegador inteiro
		return { message: "Driver fechado com sucesso\n\r\r" };
	}
	public async setSleep(time: number = 1000) {
		await this.driver.sleep(time)
	}
}
