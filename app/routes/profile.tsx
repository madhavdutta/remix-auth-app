import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { requireUser, getUserProfile } from "~/lib/auth.server";
import { supabase } from "~/lib/supabase.server";
import { profileSchema } from "~/lib/validations";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { Alert } from "~/components/ui/Alert";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const profile = await getUserProfile(request);
  
  return json({ user, profile });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const fullName = formData.get("fullName");
  const email = formData.get("email");

  try {
    const result = profileSchema.parse({ fullName, email });
    
    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: result.email,
        full_name: result.fullName,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      return json(
        { errors: { general: profileError.message } },
        { status: 400 }
      );
    }

    return json({ success: true, message: "Profile updated successfully!" });
  } catch (error) {
    if (error instanceof Error) {
      return json(
        { errors: { general: error.message } },
        { status: 400 }
      );
    }
    
    return json(
      { errors: { general: "Invalid form data" } },
      { status: 400 }
    );
  }
}

export default function Profile() {
  const { user, profile } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your personal information and account settings.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <Form method="post" className="space-y-6">
            {actionData?.success && (
              <Alert variant="success">
                {actionData.message}
              </Alert>
            )}

            {actionData?.errors?.general && (
              <Alert variant="error">
                {actionData.errors.general}
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="Full Name"
                name="fullName"
                type="text"
                defaultValue={profile?.full_name || ""}
                error={actionData?.errors?.fullName}
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                defaultValue={profile?.email || user.email}
                error={actionData?.errors?.email}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Form>
        </div>
      </div>

      {/* Account Information */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Account Information
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">User ID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{user.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Account Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(user.created_at).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email Confirmed</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.email_confirmed_at ? "Yes" : "No"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Sign In</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.last_sign_in_at 
                  ? new Date(user.last_sign_in_at).toLocaleDateString()
                  : "Never"
                }
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
