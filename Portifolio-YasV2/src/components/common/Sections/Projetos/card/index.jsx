

const ProjetoCard = ({ 
  imagem = "https://placehold.co/400x250", 
  altText = "Placeholder do Projeto", 
  titulo = "Card title", 
  descricao = "Some quick example text to build on the card title and make up the bulk of the card’s content." 
}) => {
  return (
    <div className="col">
      <div className="card h-100 shadow-sm border-0">
        <img src={imagem} className="card-img-top rounded-top " alt={altText} />
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