use newspaperdb;

create table pending_subscribe(
	id int unsigned auto_increment,
    userID int unsigned,
    days_subscribe int unsigned not null,
    primary key (id),
    foreign key (userID) references Users(id)
);