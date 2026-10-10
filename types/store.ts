export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
}

export interface OperatingHours {
  dayOfWeek: string;
  open: string;
  close: string;
  isOpenToday: boolean;
}

export interface NeighborhoodDeliveryFee {
  name: string;
  feeCents: number;
}

export interface DeliveryConfig {
  feeCents: number; // taxa padrão de entrega
  minimumOrderCents: number;
  estimatedTimeMin: number;
  estimatedTimeMax: number;
  freeDeliveryThresholdCents?: number;
  allowDelivery: boolean;
  allowPickup: boolean;
  neighborhoodFees?: NeighborhoodDeliveryFee[];
  allowOnlyRegisteredNeighborhoods?: boolean;
}

export interface StoreBrandColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  cream: string;
}

export type PaymentMethod = "pix" | "dinheiro" | "cartao_entrega";

export interface StoreConfig {
  id: string;
  name: string;
  slug: string;
  slogan: string;
  description: string;
  logoUrl: string;
  faviconUrl: string;
  currency: string;
  locale: string;
  whatsappNumber: string; // formato internacional sem caracteres especiais (ex: 5511999999999)
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  social: SocialLinks;
  operatingHours: OperatingHours[];
  delivery: DeliveryConfig;
  colors: StoreBrandColors;
  acceptedPaymentMethods: PaymentMethod[];
  allowAdvanceOrders: boolean; // se aceita pedidos com a loja fechada
  isOpen: boolean;
}

export interface Category {
  slug: string;
  name: string;
  sort: number;
  description?: string;
}

export interface AddOnItem {
  id?: string;
  name: string;
  priceCents: number;
}

export interface AddOnGroup {
  id?: string;
  name: string;
  min: number;
  max: number;
  items: AddOnItem[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  priceCents: number;
  description?: string;
}

export interface CustomizationGroup {
  id: string;
  name: string;
  description?: string;
  min: number;
  max: number;
  required: boolean;
  type: "addition" | "removal" | "choice";
  options: CustomizationOption[];
}

export interface Product {
  id?: string;
  slug: string;
  name: string;
  category: string;
  priceCents: number;
  image: string;
  description: string;
  badge?: string;
  ingredients?: string[];
  customizationGroups?: CustomizationGroup[];
  addOnGroups?: AddOnGroup[];
  available?: boolean;
}

export interface MenuData {
  store: {
    name: string;
    slogan: string;
    currency: string;
    locale: string;
    whatsapp: string;
    deliveryFeeCents: number;
    minimumOrderCents: number;
    isOpen: boolean;
  };
  categories: Category[];
  products: Product[];
  addOnGroups: AddOnGroup[];
}

export interface SelectedAddOn {
  name: string;
  priceCents: number;
  quantity: number;
}

export interface SelectedOption {
  groupId: string;
  groupName: string;
  optionId: string;
  name: string;
  priceCents: number;
}

export interface CartItem {
  cartItemId: string; // hash/id único da configuração
  product: Product;
  quantity: number;
  selectedAddOns: SelectedAddOn[]; // retrocompatibilidade
  selectedOptions: SelectedOption[];
  removedIngredients: string[];
  observation?: string;
  unitPriceCents: number;
  totalItemCents: number;
}

// Modelagem para Checkout e WhatsApp
export type FulfillmentType = "delivery" | "pickup";

export interface CustomerInfo {
  name: string;
  phone: string;
}

export interface DeliveryAddress {
  cep?: string;
  street: string;
  number: string;
  neighborhood: string;
  complement?: string;
  reference?: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  needsChange?: boolean;
  changeForCents?: number;
}

export interface OrderDraft {
  orderRef: string;
  customer: CustomerInfo;
  fulfillmentType: FulfillmentType;
  deliveryAddress?: DeliveryAddress;
  payment: PaymentInfo;
  items: CartItem[];
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  createdAt: string;
}
