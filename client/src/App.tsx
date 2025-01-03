import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

import AddItem from "@/components/add-item/add-item";
import AllReviewItems from "@/components/all-review-items/all-review-items";
import SignInForm from "@/components/auth/sign-in-form";
import SignUpForm from "@/components/auth/sign-up-form";
import TodayReviewItems from "@/components/today-review-items/today-review-items";

import { ModeToggle } from "@/components/mode-toogle";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

enum UserPhase {
  SignUp,
  LogIn,
  LoggedIn,
}

function App() {
  const [cookies] = useCookies(["Authorization"]);
  const [phase, setPhase] = useState<UserPhase>(UserPhase.LogIn);

  const [tab, setTab] = useState<"today" | "all">("today");

  useEffect(() => {
    if (cookies.Authorization) {
      setPhase(UserPhase.LoggedIn);
    }
  }, [cookies.Authorization]);

  return (
    <main className="flex flex-col items-center w-full min-w-[340px]">
      <div className="w-full max-w-[710px]">
        {phase === UserPhase.LoggedIn && (
          <>
            <div className="flex items-start justify-between h-12 mb-2">
              <h1 className="text-4xl font-extrabold tracking-tight scroll-m-20 lg:text-5xl page-title">
                Review Notes
              </h1>

              <div className="flex self-center gap-x-2">
                <AddItem />
                <ModeToggle />
              </div>
            </div>

            <Separator className="my-4" />

            <Tabs
              defaultValue="today"
              className="w-full"
              value={tab}
              onValueChange={(value) => setTab(value as "today" | "all")}
            >
              <TabsList className="w-full">
                <TabsTrigger className="w-full" value="today">
                  Today
                </TabsTrigger>

                <TabsTrigger className="w-full" value="all">
                  All
                </TabsTrigger>
              </TabsList>

              <TabsContent value="today">
                <TodayReviewItems />
              </TabsContent>

              <TabsContent value="all">
                <AllReviewItems />
              </TabsContent>
            </Tabs>
          </>
        )}

        {phase === UserPhase.LogIn && (
          <SignInForm showSignUpForm={() => setPhase(UserPhase.SignUp)} />
        )}

        {phase === UserPhase.SignUp && (
          <SignUpForm onSignUpSuccess={() => setPhase(UserPhase.LogIn)} />
        )}
      </div>
    </main>
  );
}

export default App;
