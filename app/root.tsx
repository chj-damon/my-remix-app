import {
  Form,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";

import appStylesHref from "./app.css";
import styles from './tailwind.css';
import { LinksFunction, LoaderFunctionArgs, json, redirect } from "@remix-run/node";

import { createEmptyContact, getContacts } from './data';
import { useEffect } from "react";

// 每个路由都可以导出，然后remix会收集起来，统一在页面中渲染
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
  { rel: "stylesheet", href: styles },
];

/**
 * loader函数用于在服务器端加载数据。这个函数在渲染组件之前运行，它的返回值会被传递给对应的React组件。这样，你可以在组件渲染之前获取和准备所有必要的数据。
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');

  const contacts = await getContacts(q);
  return json({ contacts, q }); // 这里返回的数据会被传递给App组件，注意这里的格式要跟App组件中的useLoaderData对应
}

/**
 * action函数用于处理表单提交或者其他类型的用户交互。这个函数在服务器端运行，并且可以修改服务器端的数据。
 */
export const action = async () => {
  const contact = await createEmptyContact();

  // return json({ contact });
  return redirect(`/contacts/${contact.id}/edit`); // 这里跳转到编辑contact的页面
}

/** 对应的路由是/，即根路由，其他页面在routes文件夹下 */
export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>(); // 这里获取到了loader返回的数据

  const navigation = useNavigation();
  const submit = useSubmit();

  const searching = navigation.location && new URLSearchParams(navigation.location.search).has('q');

  /** 使用useEffect把url里的参数同步给搜索的输入框 */
  useEffect(() => {
    const searchField = document.getElementById('q') as HTMLInputElement;
    if (!searchField) return;
    searchField.value = q || '';
  }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form id="search-form" role="search"
              onChange={e => {
                const isFirstSearch = q === null;

                submit(e.currentTarget, {
                  replace: !isFirstSearch, // 避免回退里面有太多的记录
                });
              }}
            >
              <input
                id="q"
                aria-label="Search contacts"
                className={searching ? 'searching' : ''}
                placeholder="Search"
                type="search"
                name="q"
                defaultValue={q || ""}
              />
              <div id="search-spinner" aria-hidden hidden={!searching} />
            </Form>
            <Form method="post"> {/* 这里的method="post"会触发action函数 */}
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink
                      className={({ isActive, isPending }) => isActive ? 'active' : isPending ? 'pending' : ''}
                      to={`contacts/${contact.id}`}> {/* 这里的contact.id 会对应到routes/contacts.$contactId.tsx 的$contactId */}
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{" "}
                      {contact.favorite ? (
                        <span>★</span>
                      ) : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        <div id="detail" className={navigation.state === 'loading' && !searching ? 'loading' : ''}>
          <Outlet /> {/* 这里映射的就是路由对应的页面 */}
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
