

const ProjetoCard = ({ 
  
  titulo = "Projeto", 
  descricao = "Some quick example text to build on the card title and make up the bulk of the card’s content." 
}) => {
  return (
    <div className="col">
      <div className="card h-100 shadow-sm border-0">
      
        <div className="card-body d-flex flex-column teste">
          <h5 className="card-title fw-bold text-dark">{titulo}</h5>
          <p className="card-text text-secondary mb-4">{descricao}</p>
          <div className="mt-auto">
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjetoCard;