import "./style.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="app" class="text-center bg-gray-800 text-gray-200 min-h-screen flex justify-center items-center">
    <h1 class="text-4xl font-bold">Hello from Vanilla TS with Tailwind!</h1>
  </div>
`;
