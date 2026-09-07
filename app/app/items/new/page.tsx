import { Suspense } from "react";
import { ItemEditor } from "@/components/item-editor";
export default async function Page(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  const searchParams = await props.searchParams;
  return (
    <Suspense>
      <ItemEditor initialCategory={searchParams.category} />
    </Suspense>
  );
}
