import Hook from "./hook";

test("name and type", () => {
  const hook = new Hook("/foo/bar/pre-commit/flabah");
  expect(hook.name).toEqual("flabah");
  expect(hook.type).toEqual("pre-commit");
});
