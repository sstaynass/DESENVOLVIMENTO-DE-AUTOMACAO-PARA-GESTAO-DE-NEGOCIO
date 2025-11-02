// loadSelector.ts
import { readFile } from "fs/promises";
import { resolve } from "path";

// Carregamento assíncrono do seletor baseado no caminho informado, segundo sua estrutura JSON.
export async function loadSelector(
	pathSelector: string,
): Promise<{ css?: string; xpath?: string }> {
	const jsonPath = resolve(__dirname, "json", "map.json");
	const jsonContent = await readFile(jsonPath, "utf-8");
	const mapa = JSON.parse(jsonContent);

	// Percorra os níveis do pathSelector, ex: "homepage.button" => ["homepage","button"]
	const keys = pathSelector.split(".");
	let atual: any = mapa;
	for (const k of keys) {
		if (!(k in atual))
			throw new Error(`Chave '${k}' não encontrada no mapa de seletores`);
		atual = atual[k];
	}
	return atual;
}
