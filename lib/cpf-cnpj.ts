// Utilitários para CPF e CNPJ: limpeza, máscara (com ./-), limite de dígitos
// e validação pelos dígitos verificadores oficiais.

/** Remove tudo que não for número. */
export function apenasNumeros(valor: string): string {
  return valor.replace(/\D/g, "");
}

/**
 * Aplica a máscara conforme a quantidade de dígitos digitados:
 * - até 11 dígitos -> formato de CPF: 000.000.000-00
 * - de 12 a 14 dígitos -> formato de CNPJ: 00.000.000/0000-00
 * O limite é sempre 14 dígitos (tamanho máximo do CNPJ).
 */
export function mascararCpfCnpj(valorDigitado: string): string {
  const numeros = apenasNumeros(valorDigitado).slice(0, 14);

  if (numeros.length <= 11) {
    // Máscara de CPF: 000.000.000-00
    return numeros
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  // Máscara de CNPJ: 00.000.000/0000-00
  return numeros
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

/** Regex apenas para checar o formato final (depois de mascarado). */
export const REGEX_CPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
export const REGEX_CNPJ = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

export function tipoDocumento(valor: string): "cpf" | "cnpj" | "indefinido" {
  const numeros = apenasNumeros(valor);
  if (numeros.length === 11) return "cpf";
  if (numeros.length === 14) return "cnpj";
  return "indefinido";
}

/** Valida CPF pelos dígitos verificadores (algoritmo oficial da Receita Federal). */
export function validarCpf(valor: string): boolean {
  const cpf = apenasNumeros(valor);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // todos os dígitos iguais

  const calcularDigito = (base: string, pesoInicial: number) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += parseInt(base[i], 10) * (pesoInicial - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const digito1 = calcularDigito(cpf.slice(0, 9), 10);
  const digito2 = calcularDigito(cpf.slice(0, 9) + digito1, 11);

  return cpf.endsWith(`${digito1}${digito2}`);
}

/** Valida CNPJ pelos dígitos verificadores (algoritmo oficial da Receita Federal). */
export function validarCnpj(valor: string): boolean {
  const cnpj = apenasNumeros(valor);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false; // todos os dígitos iguais

  const calcularDigito = (base: string) => {
    const pesos =
      base.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += parseInt(base[i], 10) * pesos[i];
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const digito1 = calcularDigito(cnpj.slice(0, 12));
  const digito2 = calcularDigito(cnpj.slice(0, 12) + digito1);

  return cnpj.endsWith(`${digito1}${digito2}`);
}

/**
 * Valida o documento (CPF ou CNPJ) já mascarado, checando:
 * 1. o formato (regex com pontuação "./-")
 * 2. a quantidade de números correspondente ao tipo
 * 3. os dígitos verificadores
 */
export function validarCpfOuCnpj(valorMascarado: string): {
  valido: boolean;
  tipo: "cpf" | "cnpj" | "indefinido";
  mensagem?: string;
} {
  const numeros = apenasNumeros(valorMascarado);

  if (numeros.length === 0) {
    return { valido: false, tipo: "indefinido", mensagem: "Informe o CPF ou CNPJ." };
  }

  if (numeros.length < 11) {
    return {
      valido: false,
      tipo: "indefinido",
      mensagem: "Documento incompleto. CPF precisa de 11 números.",
    };
  }

  if (numeros.length === 11) {
    if (!REGEX_CPF.test(valorMascarado)) {
      return { valido: false, tipo: "cpf", mensagem: "Formato de CPF inválido." };
    }
    if (!validarCpf(numeros)) {
      return { valido: false, tipo: "cpf", mensagem: "CPF inválido (dígitos verificadores)." };
    }
    return { valido: true, tipo: "cpf" };
  }

  if (numeros.length < 14) {
    return {
      valido: false,
      tipo: "indefinido",
      mensagem: "Documento incompleto. CNPJ precisa de 14 números.",
    };
  }

  if (numeros.length === 14) {
    if (!REGEX_CNPJ.test(valorMascarado)) {
      return { valido: false, tipo: "cnpj", mensagem: "Formato de CNPJ inválido." };
    }
    if (!validarCnpj(numeros)) {
      return { valido: false, tipo: "cnpj", mensagem: "CNPJ inválido (dígitos verificadores)." };
    }
    return { valido: true, tipo: "cnpj" };
  }

  return { valido: false, tipo: "indefinido", mensagem: "Documento com número de dígitos inválido." };
}
