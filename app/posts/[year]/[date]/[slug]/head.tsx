export default function Head() {
  return (
    <>
      {/* 以下バグのため適用されないが近いうちに解消されそう */}
      {/* https://github.com/vercel/next.js/issues/42268 */}
      <title>akfm.dev {"aaa"}</title>
    </>
  );
}
