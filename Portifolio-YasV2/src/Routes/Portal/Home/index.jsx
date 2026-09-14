import HeroSection from "../../../components/common/Sections/Hero"
import ProjetosSection from "../../../components/common/Sections/Projetos"
import SobreSection from "../../../components/common/Sections/sobre"
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