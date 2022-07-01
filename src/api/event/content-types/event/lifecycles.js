const slugify = require("slugify");

const getUniqueSlug = async (title, num = 0) => {
  let input = `${title}`;
  if (num > 0) {
    input = `${title}-${num}`;
  }
  const slug = slugify(input, {
    lower: true,
  });
  const event = await strapi.db.query("api::event.event").findOne({
    select: ["*"],
    where: { slug: slug },
    populate: { category: true },
  });

  if (!event) {
    return slug;
  } else {
    return getUniqueSlug(title, num + 1);
  }
};

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    if (data) {
      data.slug = await getUniqueSlug(data.name);
    }
  },
  async beforeUpdate(event) {
    const { data } = event.params;

    if (data.name) {
      data.slug = await getUniqueSlug(data.name);
    }
  },
};
