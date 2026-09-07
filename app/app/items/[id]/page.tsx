import { Suspense } from 'react';
import { ItemDetail } from '@/components/item-detail';
export default async function Page(props:{params: Promise<{id:string}>}) {
  const params = await props.params;
  return <Suspense><ItemDetail id={params.id}/></Suspense>;
}
