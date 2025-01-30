import { apiClient } from "@/api-client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const userTokenFormSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: "Email is required",
    })
    .email({
      message: "Email is not valid",
    }),
  password: z.string().min(36, {
    message: "Password should be at least 36 characters",
  }),
});

type SignInFormValues = z.infer<typeof userTokenFormSchema>;

interface Props {
  showSignUpForm: () => void;
}

export default function SignInForm({ showSignUpForm }: Props) {
  const [, setCookie, removeCookie] = useCookies(["Authorization"]);
  const { mutate: signIn, status: signInStatus } = useMutation({
    mutationFn: async (command: SignInFormValues) => {
      return await apiClient.signIn(command);
    },
    onSuccess: ({ accessToken }) => {
      setCookie("Authorization", accessToken, { maxAge: 60 * 60 * 24 });
      toast.success("Sign in successfully");
    },
    onError: (error) => {
      removeCookie("Authorization");
      console.error(error);
      toast.error("Failed to sign in");
    },
  });

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(userTokenFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSignUp(values: SignInFormValues) {
    signIn(values);
  }

  return (
    <section className="px-4 py-10 mt-10">
      <h2 className="mb-6 text-3xl font-bold text-center">Sign In</h2>
      <div className="max-w-sm p-6 mx-auto bg-transparent border border-gray-300 rounded-lg shadow-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSignUp)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>

          {signInStatus === "pending" && <p>Loading...</p>}
          {signInStatus === "error" && (
            <p className="mt-4 text-red-600">
              Signin Failed. Please try again.
            </p>
          )}
        </Form>

        <p className="mt-4 text-center">
          Don&apos;t have an account?{" "}
          <Button
            variant="link"
            onClick={showSignUpForm}
            className="text-blue-500"
          >
            Sign up
          </Button>
        </p>
      </div>
    </section>
  );
}
