import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Outlet } from "react-router";


const PortalPublico = () => {
  return (
     <>
    <header className="w-100">
        <Navbar/>
    </header>
    <main className="container-fluid p-0">

        <Outlet/>

    </main>
    <Footer/>
    </>
  )
}

export default PortalPublico