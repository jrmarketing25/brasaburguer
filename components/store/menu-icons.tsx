import React from "react";

export function BurgerMenuIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Top bun */}
      <path d="M4 10.5C4 6.5 7.5 4 12 4s8 2.5 8 6.5H4z" />
      {/* Sesame seeds */}
      <path d="M8.5 7h.01M12 6.5h.01M15.5 7h.01" strokeWidth="2.5" />
      {/* Lettuce / cheese wavy line */}
      <path d="M3 13.5c1-.5 2-.5 3 0s2 .5 3 0 2-.5 3 0 2 .5 3 0 2-.5 3 0 2 .5 3 0" />
      {/* Patty */}
      <rect x="3" y="15" width="18" height="2" rx="1" fill="currentColor" fillOpacity="0.25" />
      {/* Bottom bun */}
      <path d="M4 18.5h16a1 1 0 0 1 1 1c0 1.5-2.5 2.5-9 2.5s-9-1-9-2.5a1 1 0 0 1 1-1z" />
    </svg>
  );
}

export function ComboMenuIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Drink cup */}
      <path d="M4.5 8.5h5.5l-.8 11a1 1 0 0 1-1 .9H6.3a1 1 0 0 1-1-.9L4.5 8.5z" />
      <path d="M3.5 8.5h7.5M7.5 4.5l-1 4" />
      {/* Burger */}
      <path d="M12.5 13.5c0-2 1.7-3.5 4.5-3.5s4.5 1.5 4.5 3.5h-9z" />
      <path d="M12 16h9.5" />
      <path d="M12.8 18.5h7.8c0 1-1.3 1.8-3.8 1.8s-4-.8-4-1.8z" />
    </svg>
  );
}

export function FriesMenuIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* French fries */}
      <path d="M8 3.5v6.5M10.5 2.5v7.5M13.5 3v7M16 4v6M6 6v4M18 6v4" />
      {/* Box */}
      <path d="M5 10h14l-1.5 10a1.5 1.5 0 0 1-1.5 1.3H8a1.5 1.5 0 0 1-1.5-1.3L5 10z" />
      <path d="M9 14.5a3 3 0 0 0 6 0" />
    </svg>
  );
}

export function DrinkMenuIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Soda cup */}
      <path d="M6 7.5h12l-1.8 12.8a1.5 1.5 0 0 1-1.5 1.2H9.3a1.5 1.5 0 0 1-1.5-1.2L6 7.5z" />
      <path d="M5 7.5h14" />
      <path d="M8 7.5V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1.5" />
      {/* Straw */}
      <path d="M14 2l-2 3" />
    </svg>
  );
}

export function SauceMenuIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Sauce bowl rim */}
      <ellipse cx="12" cy="11.5" rx="8" ry="3.5" />
      {/* Bowl body */}
      <path d="M4 11.5c0 4.5 3.5 8.5 8 8.5s8-4 8-8.5" />
      {/* Sauce swirl */}
      <path d="M9.5 10.5c1-.6 3-.6 4.5 0" />
    </svg>
  );
}

export function DessertMenuIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Cupcake wrapper */}
      <path d="M6 12.5h12l-1.5 7.5a1 1 0 0 1-1 .9H8.5a1 1 0 0 1-1-.9L6 12.5z" />
      {/* Frosting */}
      <path d="M5 12.5c-.5-1.5.5-3 2-3 1 0 1.5.5 2 .5s1-.5 2-.5c1.5 0 2.5 1.5 2 3M11 9.5c0-1.5 1-3 2.5-3s2 1 2 2.5" />
      {/* Cherry on top */}
      <circle cx="13" cy="5" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function WhatsAppOfficialIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

