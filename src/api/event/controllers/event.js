"use strict";

const { sanitize, parseMultipartData } = require("@strapi/utils");
/**
 *  event controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::event.event", ({ strapi }) => ({
  // Get logged in user
  async me(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    const events = await strapi.entityService.findMany("api::event.event", {
      fields: [
        "name",
        "slug",
        "venue",
        "address",
        "date",
        "time",
        "organizer",
        "description",
        "createdAt",
      ],
      filters: { user: user.id },
      sort: { createdAt: "DESC" },
      populate: "image",
    });

    console.log(events);
    if (!events) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    const sanitizedEventEntity = await this.sanitizeOutput(events, ctx);

    return this.transformResponse(sanitizedEventEntity);
  },

  // Create event with a linked user

  async create(ctx) {
    let entity;

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      data.user = ctx.state.user.id;
      entity = await strapi.entityService.create("api::event.event", {
        data: { ...files },
      });
    } else {
      ctx.request.body.data.user = ctx.state.user.id;

      entity = await strapi.entityService.create("api::event.event", {
        ...ctx.request.body,
        populate: "image",
      });
    }
    const sanitizedEventEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEventEntity);
  },

  async update(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    const { id } = ctx.params;

    let entity;

    const event = await strapi.entityService.findOne("api::event.event", id, {
      populate: "user",
    });

    if (!event) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    if (event.user.id !== user.id) {
      return ctx.unauthorized("Cannot update someone else entry");
    }

    entity = await strapi.entityService.update("api::event.event", id, {
      ...ctx.request.body,
      populate: "*",
    });

    console.log(entity, "after updated");

    const sanitizedEventEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEventEntity);
  },

  async delete(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    const { id } = ctx.params;

    let entity;

    const event = await strapi.entityService.findOne("api::event.event", id, {
      populate: "user",
    });

    if (!event) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    if (event.user.id !== user.id) {
      return ctx.unauthorized("Cannot update someone else entry");
    }
    entity = await strapi.entityService.delete("api::event.event", id);

    const sanitizedEventEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEventEntity);
  },
}));
