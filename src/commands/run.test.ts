import run from "./run";

test("failing hook aborts the chain", async () => {
  const spy = jest.fn();
  const vaud = {
    hooks: {
      "pre-commit": [{ run: () => Promise.reject(new Error()) }, { run: spy }]
    }
  };

  await expect(run(vaud as any, "pre-commit", { stdin: "" })).rejects.toThrow();

  expect(spy).not.toHaveBeenCalled();
});
