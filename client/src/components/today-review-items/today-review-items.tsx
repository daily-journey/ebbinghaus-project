import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";

import { apiClient } from "@/api-client";
import ItemSheet from "@/components/today-review-items/review-item-sheet";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function TodayReviewItems() {
  const [cookies] = useCookies(["Authorization"]);
  const { data: items, isLoading: areItemsLoading } = useQuery({
    queryKey: ["today-items"],
    queryFn: () => apiClient.getTodayReviewItems(),
    enabled: !!cookies.Authorization,
  });

  return (
    <section>
      <ul className="flex flex-wrap justify-between gap-2 ">
        {areItemsLoading && <p>Loading...</p>}

        {items?.length === 0 && <p>No items to review.</p>}

        {items?.map((item) => {
          return (
            <ItemSheet
              key={item.id}
              itemId={item.id}
              trigger={
                <li>
                  <Card className="transition-all hover:bg-gray-300">
                    <CardHeader>
                      <CardTitle>{item.mainText}</CardTitle>
                    </CardHeader>
                  </Card>
                </li>
              }
            />
          );
        })}
      </ul>
    </section>
  );
}