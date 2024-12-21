import { apiClient } from "@/api-client";
import { useQuery } from "@tanstack/react-query";

export default function useReviewItemDetail({ id }: { id: number }) {
  const { data, error, isLoading } = useQuery({
    queryKey: ["review-item", id],
    queryFn: () => apiClient.getReviewItemDetail(id),
  });

  return {
    data,
    error,
    isLoading,
  };
}
