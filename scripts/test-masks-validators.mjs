import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Importa utilitários compilados ou via tsx/mjs
// Para rodar direto com node puro, importamos as funções equivalentes ou usamos execução direta
import {
  maskPhone,
  maskCep,
  maskCurrency,
  parseCurrencyToCents,
  sanitizeCustomerName,
  sanitizeAddressNumber,
  unmaskDigits,
} from "../lib/utils/masks.ts";

import {
  validatePhone,
  validateCep,
  validateCustomerName,
  validateChangeAmount,
  validateStoreWhatsApp,
} from "../lib/utils/validators.ts";

describe("BRASA BURGERS — Testes Automatizados de Máscaras e Validadores", () => {
  describe("1. Máscara e Validação de Telefone / Celular", () => {
    it("deve formatar telefone fixo (10 dígitos) corretamente", () => {
      const masked = maskPhone("1133334444");
      assert.equal(masked, "(11) 3333-4444");
      const validation = validatePhone(masked);
      assert.equal(validation.isValid, true);
      assert.equal(validation.normalized, "1133334444");
    });

    it("deve formatar celular (11 dígitos) corretamente", () => {
      const masked = maskPhone("11987654321");
      assert.equal(masked, "(11) 98765-4321");
      const validation = validatePhone(masked);
      assert.equal(validation.isValid, true);
      assert.equal(validation.normalized, "11987654321");
    });

    it("deve formatar progressivamente durante digitação", () => {
      assert.equal(maskPhone("1"), "(1");
      assert.equal(maskPhone("11"), "(11");
      assert.equal(maskPhone("119"), "(11) 9");
      assert.equal(maskPhone("119876"), "(11) 9876");
    });

    it("deve ignorar letras coladas", () => {
      const masked = maskPhone("11abc98765def4321");
      assert.equal(masked, "(11) 98765-4321");
    });

    it("deve reprovar telefone incompleto", () => {
      const validation = validatePhone("(11) 9876-543");
      assert.equal(validation.isValid, false);
      assert.match(validation.error || "", /incompleto/i);
    });

    it("deve reprovar sequências manifestamente inválidas", () => {
      assert.equal(validatePhone("(11) 11111-1111").isValid, false);
      assert.equal(validatePhone("00000000000").isValid, false);
    });

    it("deve reprovar DDD inexistente no Brasil", () => {
      const validation = validatePhone("(02) 98765-4321");
      assert.equal(validation.isValid, false);
      assert.match(validation.error || "", /DDD/i);
    });

    it("deve exigir nono dígito 9 para celular de 11 dígitos", () => {
      const validation = validatePhone("(11) 78765-4321");
      assert.equal(validation.isValid, false);
      assert.match(validation.error || "", /iniciar com o dígito 9/i);
    });
  });

  describe("2. Máscara e Validação de CEP", () => {
    it("deve formatar CEP completo de 8 dígitos", () => {
      assert.equal(maskCep("01310100"), "01310-100");
      const validation = validateCep("01310-100");
      assert.equal(validation.isValid, true);
      assert.equal(validation.normalized, "01310100");
    });

    it("deve reprovar CEP incompleto", () => {
      const validation = validateCep("01310-10");
      assert.equal(validation.isValid, false);
      assert.match(validation.error || "", /incompleto/i);
    });

    it("deve reprovar CEP com todos os dígitos iguais", () => {
      const validation = validateCep("11111-111");
      assert.equal(validation.isValid, false);
    });
  });

  describe("3. Máscara e Validação de Moeda e Troco", () => {
    it("deve converter centavos para formato de moeda brasileira", () => {
      assert.equal(maskCurrency(15000), "R$ 150,00");
      assert.equal(maskCurrency(5390), "R$ 53,90");
      assert.equal(maskCurrency(0), "R$ 0,00");
    });

    it("deve extrair centavos a partir de valores digitados com vírgula", () => {
      assert.equal(parseCurrencyToCents("R$ 150,00"), 15000);
      assert.equal(parseCurrencyToCents("150,00"), 15000);
      assert.equal(parseCurrencyToCents("R$ 53,90"), 5390);
      assert.equal(parseCurrencyToCents("100"), 100);
    });

    it("deve validar valor de troco suficiente e calcular troco em tempo real", () => {
      const totalCents = 5390; // R$ 53,90
      const changeForCents = 15000; // R$ 150,00
      const res = validateChangeAmount(changeForCents, totalCents, true);
      assert.equal(res.isValid, true);
      assert.equal(res.changeCents, 9610); // R$ 96,10 de troco
    });

    it("deve reprovar valor de troco inferior ao total do pedido", () => {
      const totalCents = 5390; // R$ 53,90
      const changeForCents = 5000; // R$ 50,00
      const res = validateChangeAmount(changeForCents, totalCents, true);
      assert.equal(res.isValid, false);
      assert.match(res.error || "", /maior ou igual ao total/i);
    });

    it("deve aprovar quando o cliente não precisa de troco", () => {
      const res = validateChangeAmount(undefined, 5390, false);
      assert.equal(res.isValid, true);
      assert.equal(res.changeCents, 0);
    });
  });

  describe("4. Sanitização e Validação do Nome do Cliente", () => {
    it("deve aceitar nomes válidos com acentos e compostos", () => {
      const res = validateCustomerName("João d'Ávila da Silva");
      assert.equal(res.isValid, true);
      assert.equal(res.normalized, "João d'Ávila da Silva");
    });

    it("deve reprovar nomes vazios ou com espaços excessivos", () => {
      assert.equal(validateCustomerName("   ").isValid, false);
      assert.equal(validateCustomerName("A").isValid, false);
    });

    it("deve sanitizar espaços múltiplos", () => {
      const sanitized = sanitizeCustomerName("  Maria    Eduarda   Santos  ");
      assert.equal(sanitized, "Maria Eduarda Santos");
    });
  });

  describe("5. Endereço e Número Residencial", () => {
    it("deve aceitar números usuais (123, 123A, S/N)", () => {
      assert.equal(sanitizeAddressNumber("123"), "123");
      assert.equal(sanitizeAddressNumber("123A"), "123A");
      assert.equal(sanitizeAddressNumber("S/N"), "S/N");
    });
  });

  describe("6. Auditoria de Segurança do WhatsApp da Loja", () => {
    it("deve identificar número de demonstração", () => {
      const audit = validateStoreWhatsApp("5511999999999");
      assert.equal(audit.isConfigured, true);
      assert.equal(audit.isDemo, true);
      assert.match(audit.error || "", /demonstração/i);
    });

    it("deve aceitar número real da hamburgueria", () => {
      const audit = validateStoreWhatsApp("5511987654321");
      assert.equal(audit.isConfigured, true);
      assert.equal(audit.isDemo, false);
      assert.equal(audit.error, undefined);
    });

    it("deve reprovar número vazio", () => {
      const audit = validateStoreWhatsApp("");
      assert.equal(audit.isConfigured, false);
    });
  });
});

