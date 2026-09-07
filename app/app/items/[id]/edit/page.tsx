import { ItemEditor } from "@/components/item-editor";
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <ItemEditor id={params.id} />;
}
