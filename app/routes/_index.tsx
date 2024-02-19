/** 在根路径/的时候，渲染这个路由 */
export default function Index() {
  return (
    <p id="index-page" className="mt-4 font-bold">
      This is a demo for Remix.
      <br />
      Check out{" "}
      <a href="https://remix.run">the docs at remix.run</a>.
    </p>
  )
}