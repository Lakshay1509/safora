SELECT
  location_id,
  (count(*)) :: integer AS review_count,
  round(avg(general_score), 2) AS avg_general,
  round(avg(transit_score), 2) AS avg_transit,
  round(avg(neighbourhood_score), 2) AS avg_neighbourhood,
  round(avg(women_safety_score), 2) AS avg_women_safety,
  max(created_at) AS last_review_at
FROM
  reviews r
GROUP BY
  location_id;