import { promises as fs } from "fs";
import path from "path";
import { RetryToolkit } from "./retryToolkit";

type FuncaoStatus = {
	nome: string;
	status: "sucesso" | "falha";
	tentativas: number;
};

type ReportTask = {
	task: string;
	status: "sucesso" | "falha";
	dataHora: string;
	funcoes: Record<string, FuncaoStatus>;
	resumo: {
		totalFuncoes: number;
		funcoesSucesso: number;
		funcoesFalha: number;
	};
};

export class RetryToolkitWithAsyncReport extends RetryToolkit {
	private report: ReportTask | null = null;

	private writeLock = Promise.resolve(); // fila para gravação serializada

	public async retryable<T>(
		fn: () => Promise<T>,
		retries = 3,
		delay = 5000,
		label = "",
	): Promise<T> {
		const funcNome = label || "função-sem-nome";
		let lastError: unknown;
		let tentativas = 0;

		for (let attempt = 1; attempt <= retries; attempt++) {
			try {
				const result = await fn();
				tentativas = attempt;

				this.registrarFuncao(funcNome, "sucesso", tentativas);
				if (label) console.log(`✅ [${label}] sucesso na tentativa ${attempt}`);

				return result;
			} catch (err) {
				tentativas = attempt;
				lastError = err;

				this.registrarFuncao(funcNome, "falha", tentativas);
				console.warn(
					`⚠️ Falha na tentativa ${attempt}/${retries}${label ? ` [${label}]` : ""}`,
					(err as Error).message,
				);

				if (attempt < retries)
					await new Promise((res) => setTimeout(res, delay));
			}
		}

		throw new Error(
			`❌ retryable: falhou após ${retries} tentativas${label ? ` [${label}]` : ""}: ${(lastError as Error)?.message}`,
			{ cause: lastError as Error },
		);
	}

	private registrarFuncao(
		nome: string,
		status: "sucesso" | "falha",
		tentativas: number,
	) {
		if (!this.report) {
			this.report = {
				task: "default",
				status: "sucesso",
				dataHora: new Date().toISOString(),
				funcoes: {},
				resumo: { totalFuncoes: 0, funcoesSucesso: 0, funcoesFalha: 0 },
			};
		}

		this.report.funcoes[nome] = { nome, status, tentativas };

		const funcoesArray = Object.values(this.report.funcoes);
		this.report.resumo.totalFuncoes = funcoesArray.length;
		this.report.resumo.funcoesSucesso = funcoesArray.filter(
			(f) => f.status === "sucesso",
		).length;
		this.report.resumo.funcoesFalha = funcoesArray.filter(
			(f) => f.status === "falha",
		).length;

		this.report.status =
			this.report.resumo.funcoesFalha > 0 ? "falha" : "sucesso";
	}

	public setTaskName(nome: string) {
		if (!this.report) {
			this.report = {
				task: nome,
				status: "sucesso",
				dataHora: new Date().toISOString(),
				funcoes: {},
				resumo: { totalFuncoes: 0, funcoesSucesso: 0, funcoesFalha: 0 },
			};
		} else {
			this.report.task = nome;
		}
	}

	public async saveReport(fileName?: string) {
		if (!this.report) {
			throw new Error("Nenhum relatório para salvar");
		}
		const nomeArquivo = fileName ?? `json/report.json`;
		const caminho = path.resolve(__dirname, nomeArquivo);

		// Serializa as gravações para evitar escritas concorrentes
		this.writeLock = this.writeLock.then(() =>
			fs.writeFile(caminho, JSON.stringify(this.report, null, 2), "utf-8"),
		);
		await this.writeLock;
		console.log(`Relatório salvo em ${caminho}`);
	}

	public getReport() {
		return this.report;
	}
}
