import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { supabase } from "~/lib/supabase.server";
import { createUserSession, getUserId } from "~/lib/auth.server";
import { signUpSchema } from "~/lib/validations";
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
  const confirmPassword = formData.get("confirmPassword");

  try {
    const result = signUpSchema.parse({ email, password, confirmPassword });
    
    const { data, error } = await supabase.auth.signUp({
      email: result.email,
      password: result.password,
    });

    if (error) {
      return json(
        { 
          errors: { email: error.message }, 
          values: { email: result.email } 
        },
        { status: 400 }
      );
    }

    if (!data.session) {
      return json(
        { 
          success: true,
          message: "Please check your email to confirm your account.",
          values: { email: result.email }
        }
      );
    }

    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: null,
        avatar_url: null,
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }

    return createUserSession(
      data.user.id,
      data.session.access_token,
      data.session.refresh_token,
      "/dashboard"
    );
  } catch (error) {
    if (error instanceof Error) {
      return json(
        { 
          errors: { email: error.message }, 
          values: { email: email?.toString() || "" } 
        },
        { status: 400 }
      );
    }
    
    return json(
      { 
        errors: { email: "Invalid form data" }, 
        values: { email: email?.toString() || "" } 
      },
      { status: 400 }
    );
  }
}

export default function SignUp() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  if (actionData?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Check your email
            </h2>
            <Alert variant="success" className="mt-4">
              {actionData.message}
            </Alert>
            <div className="mt-6">
              <Link
                to="/signin"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
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
              autoComplete="new-password"
              required
              helperText="Must be at least 8 characters long"
              error={actionData?.errors?.password}
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              error={actionData?.errors?.confirmPassword}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </Form>
      </div>
    </div>
  );
}
