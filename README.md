# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

## Development

### remix 支持的导出

```javascript
export const meta = {}; // 用于 SEO

export const links = []; // 用于引入样式和脚本

export const headers = {}; // 用于设置响应头

export const loader = async () => {}; // 用于加载数据

export const action = async () => {}; // 用于处理表单提交

export default function Component() {} // 用于渲染组件
```

### 路由系统

#### 1. 根路由

```code
app/
├── routes/
└── root.tsx
```

`root.tsx`就是整个系统的主布局，然后`routes/`下的所有页面都会被嵌套到`root.tsx`中（通过`<Outlet/>`）。

```typescript
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export default function Root() {
  return (
    <html lang="en">
      <head>
        <Links />
        <Meta />
      </head>
      <body>
        <Outlet /> // 这里会嵌套所有的页面
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

#### 2. 基础路由

```code
app/
├── routes/
│   ├── _index.tsx
│   └── about.tsx
└── root.tsx
```

`routes/`文件夹下的所有页面都是基础路由，它们都是根路由的子路由。`_index.tsx`是根路由的默认子路由。
除了`_index.tsx`之外的其他文件都是路由文件，它们跟`URL`的`pathname`是一一对应的。 比如`/about`对应`about.tsx`。

#### 3. 点分隔符

```code
app/
├── routes/
│   ├── _index.tsx
│   ├── about.tsx
│   ├── concerts.trending.tsx
│   ├── concerts.salt-lake-city.tsx
│   └── concerts.san-diego.tsx
└── root.tsx
```

它和 URL 的映射关系是：
| URL | 匹配的路由文件 |
| --- | --- |
| / | \_index.tsx |
| /about | about.tsx |
| /concerts/trending | app/routes/concerts.trending.tsx |
| /concerts/salt-lake-city | app/routes/concerts.salt-lake-city.tsx |
| /concerts/san-diego | app/routes/concerts.san-diego.tsx |

#### 4. 动态路由

```code
 app/
├── routes/
│   ├── _index.tsx
│   ├── about.tsx
│   ├── concerts.$city.tsx
│   └── concerts.trending.tsx
└── root.tsx
```

它和 URL 的映射关系是：
| URL | 匹配的路由文件 |
| --- | --- |
| / | \_index.tsx |
| /about | about.tsx |
| /concerts/trending | app/routes/concerts.trending.tsx |
| /concerts/salt-lake-city | app/routes/concerts.$city.tsx |
| /concerts/san-diego | app/routes/concerts.$city.tsx |

`$city`是一个动态参数，它会被解析成`req.params.city`。在`loader`中可以通过`params.city`获取到它的值。

```typescript
export async function loader({ params }: LoaderFunctionArgs) {
  return fakeDb.getAllConcertsForCity(params.city);
}
```

路由文件名里面可以有多个动态参数，如`concerts.$city.$date.tsx`。

```typescript
export async function loader({ params }: LoaderFunctionArgs) {
  return fakeDb.getAllConcertsForCity({
    city: params.city,
    date: params.date,
  });
}
```

#### 5. 嵌套路由

```code
app/
├── routes/
│   ├── _index.tsx
│   ├── about.tsx
│   ├── concerts._index.tsx
│   ├── concerts.$city.tsx
│   ├── concerts.trending.tsx
│   └── concerts.tsx
└── root.tsx
```

所有以`app/routes/concerts.`开头的文件都是`concerts`的子路由。`concerts._index.tsx`是`concerts`的默认子路由。

| URL                      | 匹配的路由文件                   | 布局文件                |
| ------------------------ | -------------------------------- | ----------------------- |
| /                        | \_index.tsx                      | app/root.tsx            |
| /about                   | about.tsx                        | app/root.tsx            |
| /concerts/trending       | app/routes/concerts.trending.tsx | app/routes/concerts.tsx |
| /concerts/salt-lake-city | app/routes/concerts.$city.tsx    | app/routes/concerts.tsx |
| /concerts/san-diego      | app/routes/concerts.$city.tsx    | app/routes/concerts.tsx |

比如一个 URL 是`/concerts/salt-lake-city`，那么它的 UI 布局是这样的：

```typescript
<Root>
  <Concerts>
    <City />
  </Concerts>
</Root>
```

如果我们不想要把一个路由嵌套到它的父路由中，可以在它的文件名的父路由后面加上`_`，比如`app/routes/concerts_.mine.tsx`。

```code
app/
├── routes/
│   ├── _index.tsx
│   ├── about.tsx
│   ├── concerts.$city.tsx
│   ├── concerts.trending.tsx
│   ├── concerts.tsx
│   └── concerts_.mine.tsx
└── root.tsx
```

| URL                      | 匹配的路由文件                   | 布局文件                |
| ------------------------ | -------------------------------- | ----------------------- |
| /                        | \_index.tsx                      | app/root.tsx            |
| /about                   | about.tsx                        | app/root.tsx            |
| /concerts/trending       | app/routes/concerts.trending.tsx | app/routes/concerts.tsx |
| /concerts/salt-lake-city | app/routes/concerts.$city.tsx    | app/routes/concerts.tsx |
| /concerts/san-diego      | app/routes/concerts.$city.tsx    | app/routes/concerts.tsx |
| /concerts/mine           | app/routes/concerts\_.mine.tsx   | app/root.tsx            |

还有一种情况是我们不想要在 URL 里面体现嵌套关系，那么我们可以在路由文件名之前加上`_`。

```code
app/
├── routes/
│   ├── _auth.login.tsx
│   ├── _auth.register.tsx
│   ├── _auth.tsx
│   ├── _index.tsx
│   ├── concerts.$city.tsx
│   └── concerts.tsx
└── root.tsx
```

| URL                      | 匹配的路由文件                 | 布局文件                |
| ------------------------ | ------------------------------ | ----------------------- |
| /                        | \_index.tsx                    | app/root.tsx            |
| /login                   | app/routes/\_auth.login.tsx    | app/routes/\_auth.tsx   |
| /register                | app/routes/\_auth.register.tsx | app/routes/\_auth.tsx   |
| /concerts/salt-lake-city | app/routes/concerts.$city.tsx  | app/routes/concerts.tsx |

#### 6. 可选路由

```code
app/
├── routes/
│   ├── ($lang)._index.tsx
│   ├── ($lang).$productId.tsx
│   └── ($lang).categories.tsx
└── root.tsx
```

它和 URL 的映射关系是：

| URL                      | 匹配的路由文件                    |
| ------------------------ | --------------------------------- |
| /                        | app/routes/($lang).\_index.tsx    |
| /categories              | app/routes/($lang).categories.tsx |
| /en/categories           | app/routes/($lang).categories.tsx |
| /fr/categories           | app/routes/($lang).categories.tsx |
| /american-flag-speedo    | app/routes/($lang).\_index.tsx    |
| /en/american-flag-speedo | app/routes/($lang).$productId.tsx |
| /fr/american-flag-speedo | app/routes/($lang).$productId.tsx |

注意这里`/american-flag-speedo`映射的路由文件是`app/routes/($lang).\_index.tsx`

#### 7. $路由

```code
app/
├── routes/
│   ├── _index.tsx
│   ├── $.tsx
│   ├── about.tsx
│   └── files.$.tsx
└── root.tsx
```

它和 URL 的映射关系是：

| URL                               | 匹配的路由文件         |
| --------------------------------- | ---------------------- |
| /                                 | app/routes/\_index.tsx |
| /beef/and/cheese                  | app/routes/$.tsx       |
| /about                            | app/routes/about.tsx   |
| /files/                           | app/routes/files.$.tsx |
| /files/talks/remix-conf.pdf       | app/routes/files.$.tsx |
| /files/talks/remix-conf_final.pdf | app/routes/files.$.tsx |

和动态路由参数一样，`$`也会被解析到`params`的`*`里。

```typescript
export async function loader({ params }: LoaderFunctionArgs) {
  const filePath = params["*"]; // <- 使用 * 获取 $ 后面的路径
  return fake.getFileInfo(filePath);
}
```

#### [] 强制转义.

| URL                | 匹配的路由文件                    |
| ------------------ | --------------------------------- |
| / sitemap.xml      | app/routes/sitemap[.]xml.tsx      |
| /sitemap.xml       | app/routes/[sitemap.xml].tsx      |
| /weird-url/\_index | app/routes/weird-url.[_index].tsx |
| /dolla-bills-$     | app/routes/dolla-bills-[.$].tsx   |
| /[so-weird]        | app/routes/[[so-weird]].tsx       |

#### 路由文件夹

有时候我们为了更好地组织我们的路由文件，我们会使用文件夹的方式把同一个路由的子路由放在一起，以便跟其他的路由区分开来。

**注意，采用文件夹的方式组织路由的话，这个文件夹下必须要有一个`route.tsx`文件。其他的文件就不会被当成路由了。**

```code
app/
├── routes/
│   ├── _landing._index.tsx
│   ├── _landing.about.tsx
│   ├── _landing.tsx
│   ├── app._index.tsx
│   ├── app.projects.tsx
│   ├── app.tsx
│   └── app_.projects.$id.roadmap.tsx
└── root.tsx
```

使用文件夹的方式：

```code
app/
├── routes/
│   ├── _landing._index/
│   │   ├── route.tsx
│   │   └── scroll-experience.tsx
│   ├── _landing.about/
│   │   ├── employee-profile-card.tsx
│   │   ├── get-employee-data.server.tsx
│   │   ├── route.tsx
│   │   └── team-photo.jpg
│   ├── _landing/
│   │   ├── footer.tsx
│   │   ├── header.tsx
│   │   └── route.tsx
│   ├── app._index/
│   │   ├── route.tsx
│   │   └── stats.tsx
│   ├── app.projects/
│   │   ├── get-projects.server.tsx
│   │   ├── project-buttons.tsx
│   │   ├── project-card.tsx
│   │   └── route.tsx
│   ├── app/
│   │   ├── footer.tsx
│   │   ├── primary-nav.tsx
│   │   └── route.tsx
│   ├── app_.projects.$id.roadmap/
│   │   ├── chart.tsx
│   │   ├── route.tsx
│   │   └── update-timeline.server.tsx
│   └── contact-us.tsx
└── root.tsx
```

| 平铺                       | 文件夹                           |
| -------------------------- | -------------------------------- |
| app/routes/app.tsx         | app/routes/app/route.tsx         |
| app/routes/app.\_index.tsx | app/routes/app.\_index/route.tsx |
