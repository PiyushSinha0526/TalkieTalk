import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const Cred = lazy(() => import("./pages/Cred"));
const Chat = lazy(() => import("./pages/Chat"));

function App() {
  return (
    <div className="h-screen w-screen">
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Cred />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
