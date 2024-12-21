import type {
  ReviewItem,
  ReviewItemDetail,
  TodayItem,
} from "./contract/server";

import { getCookieValue } from "@/lib/cookie";
import { getDatetime } from "@/lib/date";

interface AddItemCommand {
  mainText: string;
  subText?: string;
}

interface SignUpCommand {
  name: string;
  email: string;
  password: string;
}

interface SignInCommand {
  email: string;
  password: string;
}

interface ApiClient {
  getAllItems(criteria: "today" | "all"): Promise<ReviewItem[]>;
  addItem(item: AddItemCommand): Promise<void>;
  markAsMemorized(itemId: number): Promise<void>;
  remindLater(itemId: number): Promise<void>;
  deleteItem(itemId: number): Promise<void>;

  signUp(command: SignUpCommand): Promise<void>;
  signIn(command: SignInCommand): Promise<{ accessToken: string }>;
}

const BASE_URL = `${import.meta.env.VITE_SERVER_URL}`;

class FetchApiClient implements ApiClient {
  // TODO: extract signIn and signUp methods to AuthApiClient
  async signIn(command: SignInCommand): Promise<{
    accessToken: string;
  }> {
    const response = await fetch(`${BASE_URL}/auth/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      throw new Error(`Failed to sign in: ${command.email}`);
    }

    const accessToken = response.headers.get("authorization");

    if (!accessToken) {
      throw new Error("Failed to get access token");
    }

    return {
      accessToken,
    };
  }

  // TODO: extract signIn and signUp methods to AuthApiClient
  async signUp(command: SignUpCommand): Promise<void> {
    const response = await fetch(`${BASE_URL}/auth/sign-up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      throw new Error(`Failed to sign up: ${command.email}`);
    }
  }

  async getTodayReviewItems(): Promise<TodayItem[]> {
    const response = await customFetch(`${BASE_URL}/review-items/today`);

    return response.json();
  }

  async getAllItems(): Promise<ReviewItem[]> {
    const response = await customFetch(`${BASE_URL}/review-items`);

    return response.json();
  }

  async getReviewItemDetail(itemId: number): Promise<ReviewItemDetail> {
    const response = await customFetch(`${BASE_URL}/review-items/${itemId}`);

    return response.json();
  }

  async addItem(item: AddItemCommand): Promise<void> {
    const { offset } = getDatetime();

    const response = await customFetch(`${BASE_URL}/review-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...item,
        offset,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add item: ${item.mainText}`);
    }
  }

  async markAsMemorized(itemId: number): Promise<void> {
    const { offset } = getDatetime();

    const response = await customFetch(
      `${BASE_URL}/review-items/${itemId}/memorization`,
      {
        method: "PATCH",
        body: JSON.stringify({
          isMemorized: true,
          offset,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to mark item as memorized: ${itemId}`);
    }
  }

  async remindLater(itemId: number): Promise<void> {
    const { offset } = getDatetime();

    const response = await customFetch(
      `${BASE_URL}/review-items/${itemId}/memorization`,
      {
        method: "PATCH",
        body: JSON.stringify({
          isMemorized: false,
          offset,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to remind item: ${itemId}`);
    }
  }

  async deleteItem(itemId: number): Promise<void> {
    const response = await customFetch(`${BASE_URL}/review-items/${itemId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete item: ${itemId}`);
    }
  }
}

export const apiClient = new FetchApiClient();

const customFetch = async (input: RequestInfo, init?: RequestInit) => {
  const accessToken = getCookieValue("Authorization");
  if (!accessToken) {
    throw new Error("Failed to get access token");
  }

  return fetch(input, {
    ...init,

    headers: {
      "Content-Type": "application/json",
      Authorization: decodeURI(accessToken),
      ...init?.headers,
    },
  });
};
