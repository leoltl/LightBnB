select properties.id, properties.title, properties.cost_per_night, reservations.start_date, avg(property_reviews.rating) from reservations 
join properties on (reservations.property_id = properties.id)
join property_reviews on (reservations.property_id = property_reviews.property_id)
where reservations.guest_id = 1 and start_date < Now() ::date
group by properties.id, reservations.id
order by start_date;