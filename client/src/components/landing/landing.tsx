import { UserPhase } from "@/App";
import SignInForm from "@/components/auth/sign-in-form";
import SignUpForm from "@/components/auth/sign-up-form";

interface Props {
  phase: UserPhase;
  changePhase: (phase: UserPhase) => void;
}

export default function Landing({ phase, changePhase }: Props) {
  return (
    <>
      {/* Hero Section */}
      <section className="w-full p-4 mb-4 font-antique lg:hidden">
        <h1 className="text-6xl font-extrabold lg:text-7xl ">Re:Mem</h1>
        <p className="mt-4 text-2xl font-extrabold ">
          Repeat Memorization with an optimized review cycle
        </p>
      </section>

      <section className="flex flex-col-reverse gap-4 lg:flex-row md:p-4">
        <section className="flex-1 p-4 mb-2 md:p-16">
          {/* Hero Section */}
          <section className="hidden mb-4 font-antique lg:block">
            <h1 className="text-6xl font-extrabold lg:text-7xl ">Re:Mem</h1>
            <p className="mt-4 text-2xl font-extrabold ">
              Repeat Memorization with an optimized review cycle
            </p>
          </section>

          {/* Features Section */}
          <section className="lg:mt-8 font-geometric">
            <ol className="flex flex-col gap-2 text-xl">
              <li>
                <span className="text-lg italic font-bold font-antique">
                  Add
                </span>{" "}
                an item to memorize
              </li>
              <li>
                <span className="text-lg italic font-bold font-antique">
                  Mark
                </span>{" "}
                an item as memorized or not memorized
              </li>
              <li>
                <span className="text-lg italic font-bold font-antique">
                  Review cycle
                </span>{" "}
                is set dynamically
              </li>
              <li>
                Check your{" "}
                <span className="text-lg italic font-bold font-antique">
                  progress
                </span>{" "}
                through the{" "}
                <span className="text-lg italic font-bold font-antique">
                  calendar
                </span>
              </li>
            </ol>
          </section>

          {phase === UserPhase.LogIn && (
            <SignInForm showSignUpForm={() => changePhase(UserPhase.SignUp)} />
          )}

          {phase === UserPhase.SignUp && (
            <SignUpForm onSignUpSuccess={() => changePhase(UserPhase.LogIn)} />
          )}
        </section>

        <section className="relative flex-1 px-4 lg:py-20">
          <img
            src="/remem_calendar.png"
            alt="calendar image"
            className="w-full h-full object-cover md:rounded-[36px]"
          />
        </section>
      </section>
    </>
  );
}
