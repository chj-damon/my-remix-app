import { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { getUser, updateUser } from "~/user";

export const headers: HeadersFunction = () => ({
  "Cache-Control": "max-age=300, s-maxage=3600",
});

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  return json({
    displayName: user.displayName,
    email: user.email,
  })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const user = await getUser(request);

  await updateUser(user.id, {
    email: formData.get('email') as string,
    displayName: formData.get('displayName') as string,
  });

  return json({ ok: true });
}

export default function Page() {
  const user = useLoaderData<typeof loader>();

  return (
    <Form action="/account">
      <h1>Settings for {user.displayName}</h1>

      <input name="displayName" defaultValue={user.displayName} />
      <input name="email" defaultValue={user.email} />

      <button type="submit">Save</button>
    </Form>
  )
}