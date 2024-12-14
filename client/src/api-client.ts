import type { Item } from "./model/server";

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
  getItems(criteria: "today" | "all"): Promise<Item[]>;
  addItem(item: AddItemCommand): Promise<void>;
  markAsMemorized(itemId: number): Promise<void>;
  remindLater(itemId: number): Promise<void>;
  deleteItem(itemId: number): Promise<void>;

  signUp(command: SignUpCommand): Promise<void>;
  signIn(command: SignInCommand): Promise<{ accessToken: string }>;
}

class FetchApiClient implements ApiClient {
  async signIn(command: SignInCommand): Promise<{
    accessToken: string;
  }> {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/auth/sign-in`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(command),
      },
    );

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
  async signUp(command: SignUpCommand): Promise<void> {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/auth/sign-up`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to sign up: ${command.email}`);
    }
  }
  async getItems(criteria: "today" | "all"): Promise<Item[]> {
    const datetime = criteria === "today" ? new Date().toISOString() : "";
    const query = datetime ? `?datetime=${datetime}` : "";

    const accessToken = getCookieValue("Authorization");
    if (!accessToken) {
      throw new Error("Failed to get access token");
    }

    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/review-items${query}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: decodeURI(accessToken),
        },
      },
    );
    const data = await response.json();

    return data;
  }

  async addItem(item: AddItemCommand): Promise<void> {
    const { offset } = getDatetime();

    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/review-items`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...item,
          offset,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to add item: ${item.mainText}`);
    }
  }

  async markAsMemorized(itemId: number): Promise<void> {
    const { offset } = getDatetime();

    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/review-items/${itemId}/memorization`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
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

    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/review-items/${itemId}/memorization`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
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
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/review-items/${itemId}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to delete item: ${itemId}`);
    }
  }
}

export const apiClient = new FetchApiClient();
