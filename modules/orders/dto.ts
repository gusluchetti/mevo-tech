import type { FilteredItem } from "../../db/item.models";

export type NewOrderParams = {
  buyer_id: number,
  items: FilteredItem[];
}
