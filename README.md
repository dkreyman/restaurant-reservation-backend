# Capstone: Restaurant Reservation System

## Demo

[restaurant-reservation](https://restaurant-reservation-front.herokuapp.com/dashboard)

## Installation

1. Fork and clone [restaurant-reservation-backend](https://github.com/dkreyman/restaurant-reservation-backend) & [restaurant-reservation-frontend](https://github.com/dkreyman/restaurant-reservation-frontend) into a common folder and rename to backend & client
1. Run `cp ./back-end/.env.sample ./back-end/.env`.
1. Update the `./back-end/.env` file with the connection URL's to your ElephantSQL database instance.
1. Run `cp ./front-end/.env.sample ./front-end/.env`.
1. You should not need to make changes to the `./front-end/.env` file unless you want to connect to a backend at a location other than `http://localhost:5000`.
1. Run `npm install` to install project dependencies.
1. run npx knex migrate:latest within the back-end folder for migrations
1. run npx knex seed:run within the back-end folder to populate database with dummy data
1. Run `npm run start:dev` to start your server in development mode.

If you have trouble getting the server to run, reach out for assistance.

## FrontEnd Routes

1. "/dashboard" - is the home route showing todays reservations as default as well as all the tables
1. "/reservations/new" - is a form page to create a new reservation
1. "/reservations/:reservation_id/edit" - is where status booked reservations can edit their reservation
1. "/reservations/:reservation_id/seat" - is the page for assigning a reservation to a table
1. "/tables/new" - is the form to create a new table
1. "/search" - is a form where any reservation can be search for by phone number regardless of 'status'

## BackEnd Routes

1. "/tables" - "POST" request creates a new table. "GET" request lists all existing tables.
1. "tables/:table_id/seat" - "PUT" request assigns reservation_id to table. "DELETE" request Nullifies that assignment
1. "/reservation" - "POST" request creates a new reservation. "GET" request returns reservations whos status's are not "cancelled" or "finished"
1. "/reservations/:reservation_id/status" - "PUT" changes the status of the reservation
1. "/reservations/:reservation_id" - "GET" request returns reservations by reservation_id. "PUT" request updates reservation with new data.

## Technology Used

1. React.js, Node.js, Express, Postgresql, Knex, Bootstrap
