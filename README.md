# Customers Backend

  
API CRUD criada para o projeto customers: https://github.com/DanielSanLopes/customers  
  
Para a correta execução deste projeto é necessário executar os comandos de criação e inserção no banco de dados __(MySQL)__ escritos no arquivo **db_creation.sql**


Usando o terminal, acesse a pasta raíz do projeto e execute o  comando ``yarn``  para instalar as dependências  
Execute ``yarn start``  para inicializar o servidor localmente


Para testar o funcionamento básico da API, no navegador acesse: http://localhost:4000/     
A mensagem deve ser **"Welcome to the Customer Management API"**  


As rotas de funcionalidades são:  
  
``/customers``  
``/customers/add``  
``/customers/update/:id``  
``/customers/delete/:id``  
``/download-report``  
