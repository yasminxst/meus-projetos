
const Footer = () => {
  return (
    <>

      <footer className="bg-dark text-white-50 py-5">
        <div className="container">
          <div className="row g-4 mb-4">
            <div className="col-lg-4">
              <a className="navbar-brand fw-bold text-white d-flex align-items-center gap-2 mb-3" href="#">
                <i className="bi bi-stars text-success fs-4"></i>
                <span>Yasmin Teixeira</span>
              </a>
              <p className="small mb-3">
                Meu trabalho eleva o seu
              </p>
              
            </div>
            <div className="col-6 col-lg-2">
              <h6 className="text-white fw-bold mb-3">Lumina</h6>
              <ul className="list-unstyled small d-flex flex-column gap-2">
                <li><p>Organização</p></li>
                <li><p>Agenda</p></li>
                <li><p>Prontuários</p></li>
                
              </ul>
            </div>
            <div className="col-6 col-lg-2">
              <h6 className="text-white fw-bold mb-3">Marketing</h6>
              <ul className="list-unstyled small d-flex flex-column gap-2">
                <li><p>Criação de portifólios</p></li>
                <li><p>Secretária virtual</p></li>
                <li><p>Social Media</p></li>
              </ul>
            </div>
            <div className="col-lg-4">
              <h6 className="text-white fw-bold mb-3">Entre em contato</h6>
              <p className="small mb-3">Mande uma mensagem pelo WhatsApp e tenha mais informações</p>
              <div className="input-group mb-3">
                <input  className="form-control rounded-start-pill" placeholder="Olá, me fale mais sobre seu trabalho?" aria-label="Seu e-mail" />
                <button className="btn btn-success rounded-end-pill px-4" type="button">Enviar</button>
              </div>
            </div>
          </div>
          <hr className="border-secondary opacity-25" />
          <div className="row align-items-center small">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              &copy; 2026 Yasmin Teixeira - Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer