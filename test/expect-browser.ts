// check we are in pupetter environment
beforeAll(() => {
  // @ts-ignore
  expect(page.goto).toBeDefined();
});
