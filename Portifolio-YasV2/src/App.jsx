import { BrowserRouter, Routes, Route } from "react-router";
import PortalPublico from "./Layouts/PortalPublico";
import Home from "./Routes/Portal/Home";
import Lumina from "./Routes/Portal/Lumina";
import Login from "./Routes/Portal/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PortalPublico />}>
          <Route index element={<Home />} />
          <Route path="lumina" element={<Lumina />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;