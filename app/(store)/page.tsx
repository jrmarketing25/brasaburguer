import React from "react";
import { getMenuData } from "@/lib/data/menu";
import { HomeCatalog } from "@/components/store/home-catalog";

export default async function HomePage() {
  const menuData = await getMenuData();

  return (
    <div className="flex-1 flex flex-col w-full pb-4">
      {/* Orquestrador Responsivo: Mobile First (1 col) e Desktop Premium (3 colunas) */}
      <HomeCatalog menuData={menuData} />
    </div>
  );
}
