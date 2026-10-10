import {
  CartItem,
  CustomerInfo,
  DeliveryAddress,
  FulfillmentType,
  PaymentInfo,
} from "@/types/store";
import { formatCurrency } from "@/lib/utils";
import { validateStoreWhatsApp } from "@/lib/utils/validators";

interface FormatWhatsAppOrderParams {
  orderRef: string;
  storeName: string;
  customer: CustomerInfo;
  fulfillmentType: FulfillmentType;
  deliveryAddress?: DeliveryAddress;
  payment: PaymentInfo;
  items: CartItem[];
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
}

/**
 * Gera a mensagem textual formatada para envio ao WhatsApp da hamburgueria.
 */
export function formatWhatsAppOrderMessage({
  orderRef,
  storeName,
  customer,
  fulfillmentType,
  deliveryAddress,
  payment,
  items,
  subtotalCents,
  deliveryFeeCents,
  totalCents,
}: FormatWhatsAppOrderParams): string {
  const lines: string[] = [];

  // Cabeçalho da Mensagem
  lines.push(`*NOVO PEDIDO — ${storeName.toUpperCase()}*`);
  lines.push(`Referência: ${orderRef}`);
  lines.push("");

  // Dados do Cliente
  lines.push("*CLIENTE*");
  lines.push(`Nome: ${customer.name}`);
  lines.push(`Telefone: ${customer.phone}`);
  lines.push("");

  // Lista de Itens do Pedido
  lines.push("*ITENS DO PEDIDO*");
  items.forEach((item, index) => {
    lines.push(
      `${item.quantity}x ${item.product.name} — ${formatCurrency(
        item.unitPriceCents * item.quantity
      )}`
    );

    // Adicionais e opções pagas/escolhidas
    if (item.selectedOptions && item.selectedOptions.length > 0) {
      item.selectedOptions.forEach((opt) => {
        const extraText =
          opt.priceCents > 0
            ? ` (+ ${formatCurrency(opt.priceCents)})`
            : " (Incluso)";
        lines.push(`  + ${opt.name}${extraText}`);
      });
    }

    // Ingredientes removidos
    if (item.removedIngredients && item.removedIngredients.length > 0) {
      item.removedIngredients.forEach((rem) => {
        lines.push(`  - ${rem}`);
      });
    }

    // Observações específicas do item
    if (item.observation) {
      lines.push(`  Obs: ${item.observation}`);
    }

    if (index < items.length - 1) {
      lines.push("");
    }
  });
  lines.push("");

  // Modalidade de Entrega / Retirada
  lines.push("*MODALIDADE DE ENTREGA*");
  if (fulfillmentType === "delivery" && deliveryAddress) {
    lines.push("Tipo: Entrega no endereço");
    if (deliveryAddress.cep) {
      lines.push(`CEP: ${deliveryAddress.cep}`);
    }
    lines.push(
      `Endereço: ${deliveryAddress.street}, ${deliveryAddress.number}`
    );
    lines.push(`Bairro: ${deliveryAddress.neighborhood}`);
    if (deliveryAddress.complement) {
      lines.push(`Complemento: ${deliveryAddress.complement}`);
    }
    if (deliveryAddress.reference) {
      lines.push(`Ponto de referência: ${deliveryAddress.reference}`);
    }
  } else {
    lines.push("Tipo: Retirada no balcão do restaurante");
  }
  lines.push("");

  // Forma de Pagamento
  lines.push("*FORMA DE PAGAMENTO*");
  if (payment.method === "pix") {
    lines.push("Opção: Pix");
  } else if (payment.method === "cartao_entrega") {
    lines.push("Opção: Cartão (débito/crédito na entrega ou retirada)");
  } else if (payment.method === "dinheiro") {
    if (payment.needsChange && payment.changeForCents) {
      const troco = payment.changeForCents - totalCents;
      lines.push(
        `Opção: Dinheiro (Troco para ${formatCurrency(
          payment.changeForCents
        )} — Levar ${formatCurrency(troco)} de troco)`
      );
    } else {
      lines.push("Opção: Dinheiro (Não precisa de troco)");
    }
  }
  lines.push("");

  // Resumo Financeiro
  lines.push("*RESUMO FINANCEIRO*");
  lines.push(`Subtotal dos itens: ${formatCurrency(subtotalCents)}`);
  if (fulfillmentType === "delivery") {
    lines.push(
      `Taxa de entrega: ${
        deliveryFeeCents > 0 ? formatCurrency(deliveryFeeCents) : "Grátis"
      }`
    );
  } else {
    lines.push("Taxa de entrega: R$ 0,00 (Retirada)");
  }
  lines.push(`*TOTAL A PAGAR: ${formatCurrency(totalCents)}*`);
  lines.push("");
  lines.push("Aguardando confirmação do pedido pelo restaurante. Obrigado!");

  return lines.join("\n");
}

/**
 * Constrói a URL do WhatsApp compatível com navegadores e aplicativo nativo.
 */
export function generateWhatsAppOrderUrl(
  whatsappNumber: string,
  message: string
): string {
  const audit = validateStoreWhatsApp(whatsappNumber);
  const cleanPhone = audit.cleanPhone;
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
