import { Browser, Builder, type WebDriver } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import edge from "selenium-webdriver/edge";

type browser = "chrome" | "edge";

export class seleniumSingleton {
	private static instance: seleniumSingleton;
	private driver: WebDriver;
	private options: chrome.Options | edge.Options;
	private constructor(browser: browser, optionsArg: string) {
		if (browser === "chrome") {
			this.options = new chrome.Options();
			this.options.addArguments(optionsArg);
			this.driver = new Builder()
				.forBrowser(Browser.CHROME)
				.setChromeOptions(this.options)
				.build();
		} else if (browser === "edge") {
			this.options = new edge.Options();
			this.options.addArguments(optionsArg);
			this.driver = new Builder()
				.forBrowser(Browser.EDGE)
				.setEdgeOptions(this.options)
				.build();
		} else {
			throw new Error(`Browser inválido forneça chrome ou edge`);
		}
	}

	public static getInstance(
		browser: browser,
		optionsArg: string,
	): seleniumSingleton {
		if (!seleniumSingleton.instance) {
			seleniumSingleton.instance = new seleniumSingleton(browser, optionsArg);
		}
		return seleniumSingleton.instance;
	}

	public getDriver(): WebDriver {
		if (!this.driver) {
			throw new Error("Driver não inicializado!");
		}
		return this.driver;
	}
}
