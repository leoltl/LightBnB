SELECT properties.*, AVG(rating) from property_reviews
join properties on (properties.id = property_reviews.property_id)
where city ILIKE '%vancouver%'
group by properties.id
having avg(rating) >= 4
order by cost_per_night