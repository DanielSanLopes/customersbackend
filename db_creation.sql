create database customers
default charset utf8mb4
default collate utf8mb4_general_ci;

use customers;

##################################################################################

create table customer(
id int not null auto_increment unique,
customerName varchar(30) not null,
email varchar(150) not null,
phone varchar (20) not null,
createdAt timestamp default current_timestamp,
#-----------------------------------------------
primary key(id)
)default charset = utf8mb4;

insert into customer values (default, 'TestungName', 'test@test.com', '99987654321', default);

insert into customer values (default, 'Teste2', 'tasdaest@tasdasdest.com', '1199987654321', default);


select * from customer;