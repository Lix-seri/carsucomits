import { SellersPage } from "@/features/verification/staff-pages";

export const metadata = { title: "Sellers" };

export default async function Sellers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <SellersPage q={(await searchParams).q} />;
}
