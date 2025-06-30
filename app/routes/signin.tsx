import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { supabase } from "~/lib/supabase.server";
import { createUserSession, getUserId } from "~/lib/auth.server";
import { signInSchema } from "~/lib/validations";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { Alert } from "~/components/ui/Alert";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/dashboard");
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo") || "/dashboard";

  try {
    const result = signInSchema.parse({ email, password });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: result.email,
      password: result.password,
    });

    if (error) {
      return json(
        { errors: { email: error.message }, values: { email: result.email } },
        { status: 400 }
      );
    }

    if (!data.session) {
      return json(
        { errors: { email: "Failed to create session" }, values: { email: result.email } },
        { status: 400 }
      );
    }

    return createUserSession(
      data.user.id,
      data.session.access_token,
      data.session.refresh_token,
      typeof redirectTo === "string" ? redirectTo : "/dashboard"
    );
  } catch (error) {
    if (error instanceof Error) {
      return json(
        { errors: { email: error.message }, values: { email: email?.toString() || "" } },
        { status: 400 }
      );
    }
    
    return json(
      { errors: { email: "Invalid form data" }, values: { email: email?.toString() || "" } },
      { status: 400 }
    );
  }
}

export default function SignIn() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <Form className="mt-8 space-y-6" method="post">
          <div className="space-y-4">
            {actionData?.errors?.email && (
              <Alert variant="error">
                {actionData.errors.email}
              </Alert>
            )}

            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={actionData?.values?.email}
              error={actionData?.errors?.email}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              error={actionData?.errors?.password}
            />
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Forgot your password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </Form>
      </div>
    </div>
  );
}
