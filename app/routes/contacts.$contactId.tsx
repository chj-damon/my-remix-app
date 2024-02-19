import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import type { FunctionComponent } from "react";

import { getContact, type ContactRecord, updateContact } from "~/data";
import invariant from "tiny-invariant";

/** 根据contactId获取contact详情的逻辑 */
export const loader = async ({ params }: LoaderFunctionArgs) => {
  // 这里的contactId是从路由中获取的，即routes/contacts.$contactId.tsx中的$contactId
  const contactId = params.contactId;

  // 对参数进行校验
  invariant(contactId, "Missing contactId parameter");

  const contact = await getContact(contactId);
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ contact });
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.contactId, "Missing contactId parameter");

  const formData = await request.formData();

  return updateContact(params.contactId, {
    favorite: formData.get("favorite") === "true",
  })
}

export default function Contact() {
  const { contact } = useLoaderData<typeof loader>();

  return (
    <div id="contact">
      <div>
        <img
          alt={`${contact?.first} ${contact?.last} avatar`}
          key={contact?.avatar} // 这里的key是为了让react重新渲染img标签
          src={contact?.avatar}
        />
      </div>

      <div>
        <h1>
          {contact?.first || contact?.last ? (
            <>
              {contact?.first} {contact?.last}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
          <Favorite contact={contact} />
        </h1>

        {contact?.twitter ? (
          <p>
            <a
              href={`https://twitter.com/${contact?.twitter}`}
            >
              {contact?.twitter}
            </a>
          </p>
        ) : null}

        {contact?.notes ? <p>{contact?.notes}</p> : null}

        <div>
          <Form
            action="edit" // 这里的action是指定表单提交的地址, edit就是contacts.$contactId_.edit
          >
            <button type="submit">Edit</button>
          </Form>

          <Form
            action="destroy" // 这里的action是指定表单提交的地址, destroy就是contacts.$contactId.destroy
            method="post"
            onSubmit={(event) => {
              const response = confirm(
                "Please confirm you want to delete this record."
              );
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

/** 当我们想要关注或者取关的时候，实际上不应该引起任何URL上的变化，这时候就应该用useFetcher来实现 */
const Favorite: FunctionComponent<{
  contact: Pick<ContactRecord, "favorite">;
}> = ({ contact }) => {

  const fetcher = useFetcher();
  const favorite = fetcher.formData?.get("favorite") === "true" || contact.favorite;

  return (
    <fetcher.Form method="post"> {/* 这里的Form是从fetcher里面来的，它上面的提交操作不会引起URL的变化 */}
      <button
        aria-label={
          favorite
            ? "Remove from favorites"
            : "Add to favorites"
        }
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
};
