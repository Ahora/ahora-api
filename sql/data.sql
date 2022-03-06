SELECT "organizationId", "organizations"."login", count(*)
FROM public.docs
INNER JOIN "organizations" on "organizations"."id" = docs."organizationId"
group by "organizationId", "organizations"."login"
ORDER by count desc;

SELECT *
FROM public.users
where "createdAt" > current_date - interval '7' day;
