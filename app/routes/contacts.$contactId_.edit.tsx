/**
 * contacts.$contactId_.edit.tsx
 * 这个命名规范是remix的约定，$contactId是一个动态路由参数，这个文件会被remix自动识别为一个动态路由页面。
 * $contactId后面的_， 是为了避免把这个路由nest在$contactId下。
 */

import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getContact, updateContact } from "~/data";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.contactId, "Missing contactId");
  const contact = await getContact(params.contactId);
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ contact });
}

/** 表单提交的处理逻辑 */
export const action = async ({ request, params }: ActionFunctionArgs) => {
  invariant(params.contactId, "Missing contactId parameter");
  const formData = await request.formData(); // 获取表单数据
  const updates = Object.fromEntries(formData); // 将表单数据转换为对象

  await updateContact(params.contactId, updates); // 更新contact

  return redirect(`/contacts/${params.contactId}`); // 返回重定向的地址
}

export default function EditContact() {
  const { contact } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Form id="contact-form" method="post">
      <p>
        <span>Name</span>
        <input
          defaultValue={contact.first}
          aria-label="First name"
          name="first"
          type="text"
          placeholder="First"
        />
        <input
          aria-label="Last name"
          defaultValue={contact.last}
          name="last"
          placeholder="Last"
          type="text"
        />
      </p>
      <label>
        <span>Twitter</span>
        <input
          defaultValue={contact.twitter}
          name="twitter"
          placeholder="@jack"
          type="text"
        />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          aria-label="Avatar URL"
          defaultValue={contact.avatar}
          name="avatar"
          placeholder="https://example.com/avatar.jpg"
          type="text"
        />
      </label>
      <label>
        <span>Notes</span>
        <textarea
          defaultValue={contact.notes}
          name="notes"
          rows={6}
        />
      </label>
      <p>
        <button type="submit">Save</button>
        <button type="button" onClick={() => navigate(-1)}>Cancel</button> {/* 返回上一页 */}
      </p>
    </Form>
  )
}