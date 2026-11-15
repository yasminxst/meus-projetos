import HeroSection from "../../components/sections/Portal/Hero"
import ProjetosSection from "../../components/sections/Portal/Projetos"
import SobreSection from "../../components/sections/Portal/Sobre"
import "./home.css"

const Home = () => {
  return (
  <div className="home-page">
              <HeroSection/>
              <SobreSection/>
              <ProjetosSection/>
  </div>
  )
}

export default Home