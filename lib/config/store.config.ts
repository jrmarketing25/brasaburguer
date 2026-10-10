import { StoreConfig } from "@/types/store";

/**
 * Configuração White Label padrão do sistema.
 * Centraliza a identidade, dados de contato, entrega e modalidades de pagamento da BRASA BURGERS.
 */
export const defaultStoreConfig: StoreConfig = {
  id: "brasa-burgers",
  name: "BRASA BURGERS",
  slug: "brasa-burgers",
  slogan: "Sabor que une pessoas.",
  description:
    "Hambúrgueres artesanais na brasa viva, ingredientes selecionados e molhos especiais.",
  logoUrl: "/images/brand/logo-brasa-vetorial.svg",
  faviconUrl: "/images/brand/favicon.svg",
  currency: "BRL",
  locale: "pt-BR",
  whatsappNumber: "5511999999999", // Número de demonstração
  address: {
    street: "Av. Principal dos Burgers",
    number: "1234",
    neighborhood: "Centro Gastronômico",
    city: "São Paulo",
    state: "SP",
    zipCode: "01000-000",
  },
  social: {
    instagram: "https://instagram.com/brasaburgers",
    facebook: "https://facebook.com/brasaburgers",
    whatsapp: "https://wa.me/5511999999999",
  },
  operatingHours: [
    { dayOfWeek: "Segunda-feira", open: "18:00", close: "23:00", isOpenToday: true },
    { dayOfWeek: "Terça-feira", open: "18:00", close: "23:00", isOpenToday: true },
    { dayOfWeek: "Quarta-feira", open: "18:00", close: "23:00", isOpenToday: true },
    { dayOfWeek: "Quinta-feira", open: "18:00", close: "23:30", isOpenToday: true },
    { dayOfWeek: "Sexta-feira", open: "18:00", close: "00:00", isOpenToday: true },
    { dayOfWeek: "Sábado", open: "18:00", close: "00:00", isOpenToday: true },
    { dayOfWeek: "Domingo", open: "18:00", close: "23:00", isOpenToday: true },
  ],
  delivery: {
    feeCents: 690, // Taxa padrão caso o bairro não tenha taxa específica
    minimumOrderCents: 2000, // Pedido mínimo de R$ 20,00
    estimatedTimeMin: 35,
    estimatedTimeMax: 50,
    freeDeliveryThresholdCents: 10000, // Frete grátis acima de R$ 100,00
    allowDelivery: true,
    allowPickup: true,
    allowOnlyRegisteredNeighborhoods: false, // se true, restringe estritamente aos bairros abaixo
    neighborhoodFees: [
      { name: "Centro Gastronômico", feeCents: 500 }, // R$ 5,00
      { name: "Centro", feeCents: 500 },             // R$ 5,00
      { name: "Jardins", feeCents: 800 },            // R$ 8,00
      { name: "Pinheiros", feeCents: 900 },          // R$ 9,00
      { name: "Bela Vista", feeCents: 700 },         // R$ 7,00
      { name: "Vila Mariana", feeCents: 850 },       // R$ 8,50
      { name: "Moema", feeCents: 1000 },             // R$ 10,00
    ],
  },
  acceptedPaymentMethods: ["pix", "dinheiro", "cartao_entrega"],
  allowAdvanceOrders: false, // Se a loja estiver fechada, não permite pedidos
  colors: {
    background: "#080808",
    surface: "#1C1C1C",
    primary: "#FF6A00",
    secondary: "#E6391F",
    cream: "#F3E3C7",
  },
  isOpen: true,
};
