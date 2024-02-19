import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";

export async function action({ request }: ActionFunctionArgs) {
  // update persistent data
  const formData = await request.formData();
  const errors = await validateRecipeFormData(formData);
  if (errors) return json({ errors });

  const recipe = await db.recipes.create(formData);
  return redirect(`/recipes/${recipe.id}`);
}

export default function Page() {
  const { errors } = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.formAction === '/recipe/new';

  return (
    <Form method="post">
      <label>
        Title: <input name="title" />
        {errors?.title && <span>{errors.title}</span>}
      </label>
      <label>
        Ingredients: <textarea name="ingredients" />
        {errors?.ingredients ? (
          <span>{errors.ingredients}</span>
        ) : null}
      </label>
      <label>
        Directions: <textarea name="directions" />
        {errors?.directions ? (
          <span>{errors.directions}</span>
        ) : null}
      </label>
      <button type="submit">
        {isSubmitting ? 'Saving...' : 'Create Recipe'}
      </button>
    </Form>
  )
}