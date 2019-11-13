SELECT properties.city, count (properties.city) from reservations
join properties on (reservations.property_id = properties.id)
group by properties.city
order by count(properties.city) DESC;