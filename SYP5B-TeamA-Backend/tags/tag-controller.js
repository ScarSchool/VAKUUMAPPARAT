const Tag = require('./tag-model');
const AppError = require('../errorhandling/error-model');

const { checkTagId, createPayloadCheck, createObjectToDeliver } = require('../commons/controller-helpers');

const requiredProperties = ['name'];
// id allowed at updates
// if id is sent with a create / post request, an exception will be fired
const allowedProperties = ['name', 'useCount'];
const deliveredProperties = ['_id', 'name', 'useCount'];
const checkPayloadProps = createPayloadCheck(requiredProperties, allowedProperties);

const tagCtrl = {
	create: async (tag) => {
		try {
			checkPayloadProps(tag, 'create');
            tag.name = tag.name.toLowerCase();
			let tagWithSameName = await findByName(tag.name);
			if (tagWithSameName != null)
				throw new AppError(400, `Tag with name "${tag.name}" already exists.`);

			let createdTag = await Tag.create(tag);
			return createObjectToDeliver(createdTag, deliveredProperties);
		} catch (e) {
			throw new AppError(e);
		}
	},

	findAll: async () => {
		return await Tag.find({}, deliveredProperties.join(' ')).sort('-useCount').exec();
	},

	findById,

    findByName,
    
    includes,

	update: async (id, newValues) => {
		try {
			checkPayloadProps(newValues, 'update');

			let currentTag = await findById(id);
			if (currentTag == null)
				throw new AppError(404, 'Tag not found');

			for (let key in newValues) {
				currentTag[key] = newValues[key];
			}
            currentTag.name = currentTag.name.toLowerCase();
			await currentTag.save();
			return createObjectToDeliver(currentTag, deliveredProperties);
		} catch (e) {
			throw new AppError(e);
		}
	},

	delete: async (id) => {
		try {
            checkTagId(id);
			let currentTag = await findById(id);
			if (currentTag == null)
				throw new AppError(404, 'Tag not found');
			return currentTag.remove();
		} catch (e) {
			throw new AppError(e);
		}
	}
};

async function findById(id) {
	try {
		checkTagId(id);
		return await Tag.findById(id);
	} catch (e) {
		throw new AppError(e);
	}
}

async function findByName(tagName) {
	try {
        tagName = tagName ? tagName.toLowerCase() : '';
		let tag = await Tag.findOne(
			{ name: tagName },
			deliveredProperties.join(' ')
		);
		return tag;
	} catch (e) {
		throw new AppError(e);
	}
}

async function includes(tagName, limit) {
	try {
      tagName = tagName ? tagName.toLowerCase() : '';
      let regex = new RegExp(`.*${tagName}.*`, 'g');
		let tags = await Tag.find(
			{ name: { $regex: regex } },
			deliveredProperties.join(' ')
        ).sort('-useCount').limit(limit);
		return tags;
	} catch (e) {
		throw new AppError(e);
	}
}

module.exports = tagCtrl;