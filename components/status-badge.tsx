import { Badge } from "@/components/ui/badge";
import {
  PRODUCT_STATUS_LABEL,
  RETURN_STATUS_LABEL,
  WARRANTY_STATUS_LABEL,
  productStatusTone,
  returnStatusTone,
  warrantyStatusTone,
} from "@/lib/status";
import type { ProductStatus, ReturnStatus, WarrantyStatus } from "@/lib/types";

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return (
    <Badge dot tone={productStatusTone(status)}>
      {PRODUCT_STATUS_LABEL[status]}
    </Badge>
  );
}

export function ReturnStatusBadge({ status }: { status: ReturnStatus }) {
  return (
    <Badge dot tone={returnStatusTone(status)}>
      {RETURN_STATUS_LABEL[status]}
    </Badge>
  );
}

export function WarrantyStatusBadge({ status }: { status: WarrantyStatus }) {
  return (
    <Badge dot tone={warrantyStatusTone(status)}>
      {WARRANTY_STATUS_LABEL[status]}
    </Badge>
  );
}
