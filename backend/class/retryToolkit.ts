// retryToolkit.ts
import { Primitive } from "./primitive";

export type Task = {
	fn: () => Promise<unknown> | unknown;
	retry?: boolean;
	name?: string; // para log e debug
};

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export class RetryToolkit extends Primitive {
	/**
	 * Executa uma função com política de retry.
	 * - Tenta até `retries` vezes
	 * - Espera `delay` ms entre falhas
	 * - Loga sucesso e falha
	 */
	public async retryable<T>(
		fn: () => Promise<T>,
		retries = 3,
		delay = 5000,
		label = "",
	): Promise<T> {
		if (retries < 1) throw new Error("`retries` deve ser >= 1");

		let lastError: unknown;

		for (let attempt = 1; attempt <= retries; attempt++) {
			try {
				const result = await fn();
				if (label) console.log(`✅ [${label}] sucesso na tentativa ${attempt}`);
				return result;
			} catch (err) {
				lastError = err;
				console.warn(
					`⚠️ Falha na tentativa ${attempt}/${retries}${label ? ` [${label}]` : ""}`,
					(err as Error).message,
				);

				if (attempt < retries) await sleep(delay);
			}
		}

		// lança erro final preservando a causa original
		throw new Error(
			`❌ retryable: falhou após ${retries} tentativas${
				label ? ` [${label}]` : ""
			}: ${(lastError as Error)?.message}`,
			{ cause: lastError as Error },
		);
	}

	/** Executa uma série de funções, cada uma com retry isolado */
	public async retryableSeries(
		fns: Array<() => Promise<unknown>>,
		retries = 3,
		delay = 500,
	) {
		for (let i = 0; i < fns.length; i++) {
			await this.retryable(fns[i], retries, delay, `Tarefa #${i + 1}`);
		}
	}

	/** Executa um fluxo de tarefas, misturando retryáveis e não retryáveis */
	public async retryableFlow(tasks: Task[], retries = 3, delay = 500) {
		for (const task of tasks) {
			if (task.retry) {
				await this.retryable(async () => task.fn(), retries, delay, task.name);
			} else {
				if (task.name) console.log(`➡️ Executando [${task.name}] (sem retry)`);
				await task.fn();
			}
		}
	}
}
