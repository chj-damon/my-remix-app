import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { FC } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  // provides data to the component
  return json({
    recipes: await db.recipes.findAll({ limit: 30 });
  })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const id = formData.get('id');
  await db.recipes.delete(id);
  return json({ ok: true });
}

export default function Page() {
  const { recipes } = useLoaderData<typeof loader>();

  return (
    <ul>
      {recipes.map((recipe) => (
        <RecipeListItem key={recipe.id} recipe={recipe} />
      ))}
    </ul>
  )
}

const RecipeListItem: FC<{
  recipe: Recipe;
}> = ({ recipe }) => {
  const fetcher = useFetcher();
  const isDeleting = fetcher.state !== "idle";

  return (
    <li>
      <h2>{recipe.title}</h2>
      <fetcher.Form method="post">
        <button
          disabled={isDeleting}
          onClick={handleDelete}
          type="submit"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </fetcher.Form>
    </li>
  );
};