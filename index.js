import { createApp, useModules, finishApp } from "./app.js";
const app = createApp();

useModules(app);
finishApp(app);

try {
  const PORT = process.env.APPLICATIONPORT || 4000;
  app.listen(PORT);
  console.log(`server connected at ${PORT}`);
} catch (err) {
  console.log(err);
}
